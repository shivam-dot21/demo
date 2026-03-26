'use client';

import React, { useState, useEffect } from 'react';
import { FiPackage, FiAlertTriangle, FiRefreshCw, FiDownload, FiPlus, FiClock } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function Inventory() {
    const [items, setItems] = useState<any[]>([]);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [adjustModal, setAdjustModal] = useState<{isOpen: boolean, itemId: string | null, type: 'adjust' | 'restock'}>({ isOpen: false, itemId: null, type: 'adjust' });
    const [adjustQty, setAdjustQty] = useState('');
    const [adjustReason, setAdjustReason] = useState('');

    const [historyModal, setHistoryModal] = useState<{isOpen: boolean, history: any[], itemName: string}>({ isOpen: false, history: [], itemName: '' });

    const fetchData = async () => {
        try {
            const [allRes, lowRes] = await Promise.all([
                apiClient.get('/inventory'),
                apiClient.get('/inventory/low-stock')
            ]);
            setItems(allRes.data);
            setLowStockItems(lowRes.data);
        } catch (err) {
            console.error('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdjustSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (adjustModal.type === 'restock') {
                await apiClient.post(`/inventory/${adjustModal.itemId}/restock`, { quantity: Number(adjustQty) });
            } else {
                await apiClient.post(`/inventory/${adjustModal.itemId}/adjust`, { quantityOffset: Number(adjustQty), reason: adjustReason });
            }
            setAdjustModal({ isOpen: false, itemId: null, type: 'adjust' });
            setAdjustQty('');
            setAdjustReason('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleViewHistory = async (itemId: string, itemName: string) => {
        try {
            const res = await apiClient.get(`/inventory/${itemId}/history`);
            setHistoryModal({ isOpen: true, history: res.data, itemName });
        } catch (err) {
            console.error(err);
        }
    };

    const downloadCSV = () => {
        const headers = ['Product', 'SKU', 'Supplier', 'Location', 'Quantity', 'Reorder Point'];
        const csvContent = "data:text/csv;charset=utf-8," + 
            headers.join(",") + "\n" +
            items.map(item => [
                `"${item.product?.name || ''}"`,
                `"${item.sku || ''}"`,
                `"${item.supplier || ''}"`,
                `"${item.location || ''}"`,
                item.quantity,
                item.reorderPoint
            ].join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalValue = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh] relative">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Inventory Management</h1>
                    <p className="m-0 opacity-90">Monitor stock levels and manage order fulfillment</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadCSV} className="bg-white/20 text-white border border-white/50 px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-white/30 transition">
                        <FiDownload /> Export CSV
                    </button>
                    <button className="bg-white text-brand-primary px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                        <FiPlus /> Add Item
                    </button>
                </div>
            </div>

            <div className="flex gap-5 mb-7.5 flex-wrap">
                {[
                    { label: "Total Unique Items", value: items.length },
                    { label: "Low Stock Items", value: lowStockItems.length, color: "text-[#f59e0b]" },
                    { label: "Out of Stock", value: items.filter(i => i.quantity === 0).length, color: "text-[#c62828]" },
                    { label: "Estimated Value", value: `$${totalValue.toLocaleString()}` },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 flex-1 min-w-[200px] shadow-sm">
                        <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color || 'text-gray-800'}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {lowStockItems.length > 0 && (
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5 flex items-center gap-[15px] mb-[30px] text-[#92400e]">
                    <FiAlertTriangle size={32} className="text-yellow-600" />
                    <div>
                        <div className="font-bold text-lg">Low Stock Warning</div>
                        <div className="text-sm">There are {lowStockItems.length} items currently at or below their reorder point. Consider restocking soon.</div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[15px] shadow-md border border-gray-200 overflow-hidden mb-6.25">
                <div className="p-[15px] flex justify-between items-center bg-gray-50 border-b border-gray-200">
                    <h3 className="m-0 text-lg font-semibold text-gray-800">Stock List</h3>
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-primary bg-transparent text-brand-primary font-bold hover:bg-brand-primary/10 transition">
                        <FiRefreshCw /> Refresh Sync
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4">Stock Level</th>
                                <th className="p-4">Reorder Pt</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-6 text-gray-500">Loading inventory...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-6 text-gray-500">No inventory found</td></tr>
                            ) : items.map(item => (
                                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-4 font-bold text-gray-800">{item.product?.name || 'Unknown Product'}</td>
                                    <td className="p-4 text-gray-600">{item.sku || '-'}</td>
                                    <td className="p-4 text-gray-600">{item.supplier || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${item.quantity <= item.reorderPoint ? 'text-red-600' : 'text-green-600'}`}>{item.quantity}</span>
                                            {item.quantity <= item.reorderPoint && <FiAlertTriangle className="text-red-500" title="Low Stock" />}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{item.reorderPoint}</td>
                                    <td className="p-4 space-x-2 text-right">
                                        <button 
                                            onClick={() => setAdjustModal({ isOpen: true, itemId: item._id, type: 'restock' })}
                                            className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded hover:bg-green-200 transition"
                                        >
                                            Restock
                                        </button>
                                        <button 
                                            onClick={() => setAdjustModal({ isOpen: true, itemId: item._id, type: 'adjust' })}
                                            className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded hover:bg-gray-200 transition"
                                        >
                                            Adjust
                                        </button>
                                        <button 
                                            onClick={() => handleViewHistory(item._id, item.product?.name)}
                                            className="text-xs text-brand-primary font-bold px-2 py-1 rounded hover:bg-brand-primary/10 transition"
                                            title="History"
                                        >
                                            <FiClock className="inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Modal */}
            {adjustModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                    <div className="bg-white p-6 rounded-xl w-[400px] shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">{adjustModal.type === 'restock' ? 'Restock Item' : 'Adjust Stock'}</h2>
                        <form onSubmit={handleAdjustSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity {adjustModal.type === 'adjust' && '(Use +/-)'}</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={adjustQty} 
                                    onChange={e => setAdjustQty(e.target.value)} 
                                    className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none"
                                />
                            </div>
                            {adjustModal.type === 'adjust' && (
                                <div className="mb-5">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={adjustReason} 
                                        onChange={e => setAdjustReason(e.target.value)} 
                                        className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setAdjustModal({ isOpen: false, itemId: null, type: 'adjust' })} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded font-bold hover:bg-brand-primary-dark">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                    <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">History: {historyModal.itemName}</h2>
                            <button onClick={() => setHistoryModal({ isOpen: false, history: [], itemName: '' })} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {historyModal.history.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">No history available</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left">Date</th>
                                            <th className="p-2 text-left">Type</th>
                                            <th className="p-2 text-left">Qty</th>
                                            <th className="p-2 text-left">Reason / By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyModal.history.map((record, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="p-2 text-gray-500">{new Date(record.date).toLocaleString()}</td>
                                                <td className="p-2 capitalize">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.type === 'in' ? 'bg-green-100 text-green-700' : record.type === 'out' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {record.type}
                                                    </span>
                                                </td>
                                                <td className="p-2 font-bold">{record.quantity > 0 ? `+${record.quantity}` : record.quantity}</td>
                                                <td className="p-2 text-gray-600">
                                                    <div>{record.reason}</div>
                                                    <div className="text-xs text-gray-400">{record.performedBy?.name || 'System'}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
