'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/client';
import { FiSearch, FiFileText, FiPlus, FiUser, FiClock, FiDollarSign, FiX, FiCheckCircle } from 'react-icons/fi';
import DocumentManager from '@/features/documents/components/DocumentManager';

const ContractManagement = () => {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState<any>(null);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/contracts');
            setContracts(response.data);
        } catch (err) {
            console.error('Failed to fetch contracts');
            // Fallback for demo if API fails
            setContracts([
                { _id: '64f1a2b3c4d5e6f7a8b9c1d1', title: 'Enterprise SLA - TechCorp', customer: { name: 'TechCorp Solutions' }, status: 'Active', value: 50000, createdAt: new Date() },
                { _id: '64f1a2b3c4d5e6f7a8b9c1d2', title: 'Annual Maintenance - Globex', customer: { name: 'Globex Corp' }, status: 'Signed', value: 12000, createdAt: new Date() },
                { _id: '64f1a2b3c4d5e6f7a8b9c1d3', title: 'Consulting Agreement - Initech', customer: { name: 'Initech' }, status: 'Draft', value: 5000, createdAt: new Date() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const filteredContracts = contracts.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-50 text-green-700 border-green-100';
            case 'signed': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'draft': return 'bg-gray-50 text-gray-700 border-gray-100';
            case 'expired': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh] font-sans">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[20px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-black tracking-tight">Contract Management</h1>
                    <p className="m-0 opacity-90 text-sm font-medium">Draft, sign, and track your business agreements</p>
                </div>
                <button className="bg-white text-brand-primary px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-gray-100 transition shadow-md">
                    <FiPlus /> New Contract
                </button>
            </div>

            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex justify-between items-center gap-5 flex-wrap mb-6.25">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-brand-primary focus:bg-white transition-all font-medium"
                        placeholder="Search contracts by title or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-bold">Loading contracts...</div>
                ) : filteredContracts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 italic">No contracts found.</div>
                ) : (
                    filteredContracts.map(contract => (
                        <div 
                            key={contract._id} 
                            onClick={() => setSelectedContract(contract)}
                            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary text-xl group-hover:bg-brand-primary group-hover:text-white transition-all">
                                    <FiFileText />
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(contract.status)}`}>
                                    {contract.status}
                                </span>
                            </div>
                            <h3 className="font-black text-gray-800 text-lg mb-1 group-hover:text-brand-primary transition-colors">{contract.title}</h3>
                            <p className="text-gray-400 text-sm font-medium mb-6 flex items-center gap-2">
                                <FiUser className="text-gray-300" /> {contract.customer?.name}
                            </p>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-brand-primary-dark font-black">
                                    <FiDollarSign /> {contract.value?.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-300 font-black uppercase tracking-tighter flex items-center gap-1">
                                    <FiClock /> {new Date(contract.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Contract Detail Modal */}
            {selectedContract && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1500] flex items-center justify-center p-5">
                    <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 bg-brand-primary text-white flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl">
                                    <FiFileText />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black m-0 tracking-tight">{selectedContract.title}</h2>
                                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Contract ID: {selectedContract._id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedContract(null)}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center bg-gray-50/30">
                                    <FiCheckCircle size={48} className="text-brand-primary/20 mb-3" />
                                    <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-1">Status</h4>
                                    <p className="text-brand-primary font-black text-xl uppercase">{selectedContract.status}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="font-black text-gray-800 border-b border-gray-100 pb-2 text-[10px] uppercase tracking-widest text-gray-400">Agreement Info</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiUser className="text-gray-300" />
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-gray-400">Customer</div>
                                                <div className="text-gray-700 font-bold">{selectedContract.customer?.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiDollarSign className="text-gray-300" />
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-gray-400">Contract Value</div>
                                                <div className="text-gray-800 font-black">${selectedContract.value?.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="lg:col-span-2 h-full flex flex-col">
                                <DocumentManager relatedTo="Contract" relatedId={selectedContract._id} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractManagement;
