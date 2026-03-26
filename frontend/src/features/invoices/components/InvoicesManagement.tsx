'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiCheck, FiPlus, FiSend } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function InvoicesManagement() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        try {
            const res = await apiClient.get('/invoices');
            setInvoices(res.data);
        } catch (err) {
            console.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const markPaid = async (id: string) => {
        try {
            await apiClient.put(`/invoices/${id}/paid`);
            fetchInvoices();
        } catch (err) {
            console.error('Failed to mark paid');
        }
    };

    const downloadPDF = (id: string) => {
        window.open(`http://localhost:5001/api/invoices/${id}/pdf`, '_blank'); // Using local API endpoint for proxy
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-300 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        (inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Invoices & Billing</h1>
                    <p className="m-0 opacity-90">Manage customer invoices and payments</p>
                </div>
                <button className="bg-white text-brand-primary px-4 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                    <FiPlus /> Create Invoice
                </button>
            </div>

            <div className="bg-white rounded-[15px] p-6.25 shadow-md border border-gray-200 flex justify-between items-center mb-6.25">
                <div className="relative">
                    <FiSearch className="absolute left-[15px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-80 text-sm outline-none focus:border-brand-primary transition-colors"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[15px] shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                            <th className="p-4">Invoice #</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center p-6">Loading invoices...</td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr><td colSpan={6} className="text-center p-6 text-gray-500">No invoices found</td></tr>
                        ) : filteredInvoices.map(invoice => (
                            <tr key={invoice._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="p-4 font-bold text-gray-800">{invoice.invoiceNumber}</td>
                                <td className="p-4">
                                    <div className="font-semibold text-gray-700">{invoice.customer?.name}</div>
                                    <div className="text-xs text-gray-500">{invoice.customer?.email}</div>
                                </td>
                                <td className="p-4 text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-gray-800">${invoice.totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 text-gray-500">
                                        <button 
                                            onClick={() => downloadPDF(invoice._id)}
                                            className="p-1.5 bg-gray-100 rounded hover:bg-brand-primary hover:text-white transition"
                                            title="Download PDF"
                                        >
                                            <FiDownload />
                                        </button>
                                        {invoice.status === 'sent' && (
                                            <button 
                                                onClick={() => markPaid(invoice._id)}
                                                className="p-1.5 bg-gray-100 rounded hover:bg-green-500 hover:text-white transition"
                                                title="Mark Paid"
                                            >
                                                <FiCheck />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
