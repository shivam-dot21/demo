const express = require('express');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get total customers
    const totalCustomers = await Customer.countDocuments();

    // Get active customers (assuming active means created in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get new customers this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const revenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    res.json({
      totalCustomers,
      activeCustomers,
      newCustomers,
      monthlyRevenue: revenue
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get sales analytics
router.get('/sales', auth, async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json(salesData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Export Data
router.get('/export', auth, async (req, res) => {
  try {
    const { Parser } = require('json2csv');
    const { type } = req.query;
    let data;
    
    if (type === 'customers') {
      const customers = await Customer.find().lean();
      data = customers.map(c => ({
        Name: c.name, Email: c.email, Status: c.status, 
        Segment: c.segment || '', Tags: c.tags?.join(', ') || ''
      }));
    } else if (type === 'orders') {
      const orders = await Order.find().populate('customer', 'name').lean();
      data = orders.map(o => ({
        OrderNumber: o.orderNumber, Customer: o.customer?.name || '', 
        Status: o.status, Total: o.totalAmount, Date: o.createdAt
      }));
    } else if (type === 'inventory') {
      const Inventory = require('../models/Inventory');
      const inventory = await Inventory.find().populate('product', 'name').lean();
      data = inventory.map(i => ({
        Product: i.product?.name || '', SKU: i.sku || '', 
        Quantity: i.quantity, ReorderPoint: i.reorderPoint
      }));
    } else {
      return res.status(400).json({ msg: 'Invalid export type' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ msg: 'No data found to export' });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during export');
  }
});

module.exports = router;
