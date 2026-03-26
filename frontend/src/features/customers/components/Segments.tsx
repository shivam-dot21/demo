'use client';

import React, { useState, useEffect } from 'react';
import { FiPieChart, FiUsers, FiDollarSign, FiFilter, FiTag } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function Segments() {
    const [segments, setSegments] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
    const [segmentCustomers, setSegmentCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [segRes, tagRes] = await Promise.all([
                apiClient.get('/customers/segments/all'),
                apiClient.get('/customers/tags/all')
            ]);
            setSegments(segRes.data);
            setTags(tagRes.data);
        } catch (err) {
            console.error('Failed to load segments');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomersBySegment = async (segment: string) => {
        try {
            const res = await apiClient.get(`/customers?segment=${segment}`);
            setSegmentCustomers(res.data);
            setSelectedSegment(segment);
        } catch (err) {
            console.error('Failed to load segment customers');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25">
                <h1 className="m-0 mb-2.5 text-[32px] font-bold">Customer Segmentation</h1>
                <p className="m-0 opacity-90">Analyze customer segments and tag distributions</p>
            </div>

            <div className="flex gap-6 items-start">
                <div className="w-1/3 space-y-6">
                    <div className="bg-white rounded-[15px] shadow-md border border-gray-200 p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><FiPieChart /> Segments</h3>
                        {loading ? (
                            <div className="text-gray-500 text-sm">Loading segments...</div>
                        ) : segments.length === 0 ? (
                            <div className="text-gray-500 text-sm">No segments defined.</div>
                        ) : (
                            <div className="space-y-3">
                                {segments.map((seg, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => fetchCustomersBySegment(seg.segment)}
                                        className={`p-4 border rounded-xl cursor-pointer transition ${selectedSegment === seg.segment ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-brand-primary/30 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-bold text-gray-800 mb-2">{seg.segment}</div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 flex items-center gap-1"><FiUsers /> {seg.count}</span>
                                            <span className="text-brand-primary font-bold flex items-center gap-1"><FiDollarSign /> {seg.totalRevenue?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[15px] shadow-md border border-gray-200 p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><FiTag /> Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((t, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                    {t.tag} <span className="bg-white px-1.5 py-0.5 rounded-full text-xs">{t.count}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-2/3">
                    {selectedSegment ? (
                        <div className="bg-white rounded-[15px] shadow-md border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800">Customers in {selectedSegment}</h3>
                                <span className="text-sm font-bold bg-white px-3 py-1 rounded shadow-sm">{segmentCustomers.length} Total</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Industry</th>
                                        <th className="p-4">Tags</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {segmentCustomers.map(cust => (
                                        <tr key={cust._id} className="border-b border-gray-50">
                                            <td className="p-4 font-bold text-gray-800">{cust.name}</td>
                                            <td className="p-4 text-gray-600">{cust.email}</td>
                                            <td className="p-4 text-gray-600">{cust.industry || '-'}</td>
                                            <td className="p-4 flex gap-1 flex-wrap">
                                                {cust.tags?.map((tag: string) => (
                                                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wider font-bold">{tag}</span>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[15px] shadow-md border border-gray-200 p-20 text-center text-gray-400">
                            <FiFilter className="text-6xl mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2 text-gray-500">Select a Segment</h3>
                            <p>Click on a segment on the left to view the customers that belong to it.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
