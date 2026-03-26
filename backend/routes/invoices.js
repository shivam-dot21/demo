const express = require('express');
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Get all
router.get('/', auth, async (req, res) => {
  try {
    const { status, customer, startDate, endDate } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const invoices = await Invoice.find(query).populate('customer', 'name email address').sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer', 'name email address phone');
    if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    // Calc totals
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    invoice.taxAmount = invoice.subtotal * (invoice.taxRate / 100);
    invoice.totalAmount = invoice.subtotal + invoice.taxAmount - (invoice.discount || 0);
    
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.items) {
      updates.subtotal = updates.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      updates.taxAmount = updates.subtotal * ((updates.taxRate || 0) / 100);
      updates.totalAmount = updates.subtotal + updates.taxAmount - (updates.discount || 0);
    }
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Mark Sent
router.put('/:id/send', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'sent', sentAt: Date.now() }, { new: true });
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Mark Paid
router.put('/:id/paid', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'paid', paidAt: Date.now() }, { new: true });
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete Draft
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
    if (invoice.status !== 'draft') return res.status(400).json({ msg: 'Only draft invoices can be deleted' });
    
    await invoice.deleteOne();
    res.json({ msg: 'Invoice deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Generate PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer', 'name email address');
    if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`);
    doc.moveDown();
    
    // Customer Info
    doc.text(`Bill To:`);
    doc.text(`${invoice.customer.name}`);
    doc.text(`${invoice.customer.email}`);
    if (invoice.customer.address) doc.text(`${invoice.customer.address}`);
    doc.moveDown(2);

    // Items table header
    let top = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, top);
    doc.text('Qty', 300, top, { width: 50, align: 'right' });
    doc.text('Price', 350, top, { width: 80, align: 'right' });
    doc.text('Total', 430, top, { width: 80, align: 'right' });
    doc.font('Helvetica');
    
    doc.moveTo(50, top + 15).lineTo(510, top + 15).stroke();
    
    let currentY = top + 25;
    invoice.items.forEach(item => {
      doc.text(item.description, 50, currentY);
      doc.text(item.qty.toString(), 300, currentY, { width: 50, align: 'right' });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 350, currentY, { width: 80, align: 'right' });
      doc.text(`$${item.total.toFixed(2)}`, 430, currentY, { width: 80, align: 'right' });
      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(510, currentY).stroke();
    currentY += 15;

    // Totals
    doc.font('Helvetica-Bold');
    doc.text(`Subtotal:`, 350, currentY, { width: 80, align: 'right' });
    doc.text(`$${invoice.subtotal.toFixed(2)}`, 430, currentY, { width: 80, align: 'right' });
    currentY += 20;

    if (invoice.taxAmount > 0) {
      doc.text(`Tax (${invoice.taxRate}%):`, 350, currentY, { width: 80, align: 'right' });
      doc.text(`$${invoice.taxAmount.toFixed(2)}`, 430, currentY, { width: 80, align: 'right' });
      currentY += 20;
    }
    
    if (invoice.discount > 0) {
      doc.text(`Discount:`, 350, currentY, { width: 80, align: 'right' });
      doc.text(`-$${invoice.discount.toFixed(2)}`, 430, currentY, { width: 80, align: 'right' });
      currentY += 20;
    }

    doc.fontSize(14).text(`Total:`, 350, currentY + 5, { width: 80, align: 'right' });
    doc.text(`$${invoice.totalAmount.toFixed(2)}`, 430, currentY + 5, { width: 80, align: 'right' });

    doc.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500).send('Server error');
  }
});

module.exports = router;
