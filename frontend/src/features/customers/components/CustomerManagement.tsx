'use client';

import React, { useState } from 'react';
import { FiSearch, FiUser, FiMail, FiPhone, FiMapPin, FiX } from 'react-icons/fi';
import DocumentManager from '@/features/documents/components/DocumentManager';

const CustomerManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const customers = [
        { id: '64f1a2b3c4d5e6f7a8b9c0d1', name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', status: 'Active', location: 'Mumbai, India', totalOrders: 12, spent: '₹1,24,000' },
        { id: '64f1a2b3c4d5e6f7a8b9c0d2', name: 'Jane Smith', email: 'jane@microsoft.com', phone: '+91 87654 32109', status: 'Active', location: 'Delhi, India', totalOrders: 8, spent: '₹85,000' },
        { id: '64f1a2b3c4d5e6f7a8b9c0d3', name: 'Robert Brown', email: 'robert@amazon.com', phone: '+91 76543 21098', status: 'Inactive', location: 'Bangalore, India', totalOrders: 3, spent: '₹21,000' },
        { id: '64f1a2b3c4d5e6f7a8b9c0d4', name: 'Alice Wilson', email: 'alice@google.com', phone: '+91 65432 10987', status: 'Active', location: 'Pune, India', totalOrders: 15, spent: '₹2,10,000' },
        { id: '64f1a2b3c4d5e6f7a8b9c0d5', name: 'Charlie Davis', email: 'charlie@netflix.com', phone: '+91 54321 09876', status: 'Active', location: 'Hyderabad, India', totalOrders: 6, spent: '₹54,000' },
    ];

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh] font-sans">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25">
                <h1 className="m-0 mb-2.5 text-[32px] font-bold">Customer Management</h1>
                <p className="m-0 opacity-90">View and manage your customer database</p>
            </div>

            <div className="bg-white rounded-[15px] p-6.25 shadow-md border border-gray-200 flex justify-between items-center gap-5 flex-wrap mb-6.25">
                <div className="relative">
                    <FiSearch className="absolute left-[15px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-80 text-sm outline-none focus:border-brand-primary transition-colors font-sans"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2.5 font-sans">
                    {['All', 'Active', 'Inactive'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg border border-gray-200 font-semibold text-sm transition-all duration-200 ${activeFilter === filter ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[15px] shadow-md border border-gray-200 p-2.5 overflow-hidden font-sans">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b-2 border-gray-50 text-gray-400 text-sm">
                                <th className="p-[15px]">Customer</th>
                                <th className="p-[15px]">Contact Info</th>
                                <th className="p-[15px]">Location</th>
                                <th className="p-[15px]">Status</th>
                                <th className="p-[15px]">Orders</th>
                                <th className="p-[15px]">Total Spent</th>
                                <th className="p-[15px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-[15px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                <FiUser size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{customer.name}</div>
                                                <div className="text-[10px] uppercase font-black tracking-widest text-gray-300">#CUST-{customer.id.substring(18)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-[15px]">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                                                <FiMail size={14} className="text-gray-400" /> {customer.email}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                                                <FiPhone size={14} className="text-gray-400" /> {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-[15px]">
                                        <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                                            <FiMapPin size={14} className="text-gray-400" /> {customer.location}
                                        </div>
                                    </td>
                                    <td className="p-[15px]">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${customer.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="p-[15px] text-gray-800 font-bold">{customer.totalOrders}</td>
                                    <td className="p-[15px] text-gray-800 font-black">{customer.spent}</td>
                                    <td className="p-[15px] text-right">
                                        <button 
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="px-4 py-1.5 bg-gray-50 border border-gray-200 text-brand-primary rounded-lg cursor-pointer font-bold text-xs hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1500] flex items-center justify-center p-5 font-sans">
                    <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 bg-brand-primary text-white flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl">
                                    <FiUser />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black m-0">{selectedCustomer.name}</h2>
                                    <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Customer ID: {selectedCustomer.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-sm text-gray-600 shadow-inner">
                                    "Customer is highly interested in enterprise solutions. Last meeting went well, follow up scheduled for next week."
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold uppercase text-[10px]">Email</span>
                                            <span className="text-gray-700 font-medium">{selectedCustomer.email}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold uppercase text-[10px]">Phone</span>
                                            <span className="text-gray-700 font-medium">{selectedCustomer.phone}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold uppercase text-[10px]">Location</span>
                                            <span className="text-gray-700 font-medium">{selectedCustomer.location}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold uppercase text-[10px]">Total Orders</span>
                                            <span className="text-gray-700 font-bold">{selectedCustomer.totalOrders}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="lg:col-span-2 h-full flex flex-col">
                                <DocumentManager relatedTo="Customer" relatedId={selectedCustomer.id} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
