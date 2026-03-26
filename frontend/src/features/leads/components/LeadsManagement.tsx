'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiMail, FiPhone, FiFilter, FiPlus } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function LeadsManagement() {
    const [leads, setLeads] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await apiClient.get('/leads');
                setLeads(response.data);
            } catch (err) {
                console.error("Failed to fetch leads");
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    const convertLead = async (id: string) => {
        try {
            await apiClient.post(`/leads/${id}/convert`);
            const response = await apiClient.get('/leads');
            setLeads(response.data);
            alert("Lead converted successfully!");
        } catch (error) {
            console.error("Error converting lead", error);
            alert("Cannot convert lead");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'contacted': return 'bg-yellow-100 text-yellow-800';
            case 'qualified': return 'bg-green-100 text-green-800';
            case 'unqualified': return 'bg-red-100 text-red-800';
            case 'converted': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getScoreColor = (score: number) => {
        if (score <= 40) return 'bg-red-500';
        if (score <= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    const filteredLeads = leads.filter(lead => 
        (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         lead.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Lead Management</h1>
                    <p className="m-0 opacity-90">View and manage sales leads</p>
                </div>
                <button className="bg-white text-brand-primary px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                    <FiPlus /> Add Lead
                </button>
            </div>

            <div className="bg-white rounded-[15px] p-6.25 shadow-md border border-gray-200 flex justify-between items-center gap-5 flex-wrap mb-6.25">
                <div className="relative">
                    <FiSearch className="absolute left-[15px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-80 text-sm outline-none focus:border-brand-primary transition-colors"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[15px] shadow-md border border-gray-200 p-2.5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="text-left border-b-2 border-gray-50 text-gray-400">
                                <th className="p-[15px]">Name</th>
                                <th className="p-[15px]">Company</th>
                                <th className="p-[15px]">Source</th>
                                <th className="p-[15px]">Status</th>
                                <th className="p-[15px]">Score</th>
                                <th className="p-[15px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">Loading leads...</td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">No leads found</td>
                                </tr>
                            ) : filteredLeads.map(lead => (
                                <tr key={lead._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-[15px] font-semibold text-gray-800">{lead.name}</td>
                                    <td className="p-[15px]">{lead.company || '-'}</td>
                                    <td className="p-[15px] capitalize">{lead.source?.replace('_', ' ')}</td>
                                    <td className="p-[15px]">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-[15px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{lead.score}</span>
                                            <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full ${getScoreColor(lead.score)}`} style={{ width: `${lead.score}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-[15px]">
                                        {lead.status === 'qualified' && (
                                            <button 
                                                onClick={() => convertLead(lead._id)}
                                                className="bg-brand-primary text-white px-3 py-1 rounded text-xs hover:bg-brand-primary-dark transition"
                                            >
                                                Convert
                                            </button>
                                        )}
                                        {lead.status === 'converted' && (
                                            <span className="text-xs text-gray-500 font-bold">Converted</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
