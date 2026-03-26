'use client';

import React, { useState, useEffect } from 'react';
import { FiMail, FiPlus, FiEdit2, FiTrash2, FiSend, FiCode } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function EmailTemplates() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [sendModal, setSendModal] = useState<{isOpen: boolean, template: any}>({ isOpen: false, template: null });
    
    // Form state
    const [form, setForm] = useState({ name: '', subject: '', body: '', category: 'marketing', variables: '' });
    
    const fetchTemplates = async () => {
        try {
            const res = await apiClient.get('/email-templates');
            setTemplates(res.data);
        } catch (err) {
            console.error('Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const vars = form.variables.split(',').map(v => v.trim()).filter(Boolean);
            await apiClient.post('/email-templates', { ...form, variables: vars });
            setShowModal(false);
            setForm({ name: '', subject: '', body: '', category: 'marketing', variables: '' });
            fetchTemplates();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await apiClient.delete(`/email-templates/${id}`);
            fetchTemplates();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const to = formData.get('to') as string;
        const contextObj: any = {};
        
        sendModal.template.variables.forEach((v: string) => {
            const val = formData.get(`var_${v}`) as string;
            if (val) contextObj[v.replace(/[{}]/g, '')] = val; // Assuming variables are formatted like {{name}} 
        });

        try {
            await apiClient.post('/email-templates/send', {
                templateId: sendModal.template._id,
                to,
                context: contextObj
            });
            alert('Email sent successfully!');
            setSendModal({ isOpen: false, template: null });
        } catch (err) {
            alert('Failed to send email.');
            console.error(err);
        }
    };

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Email Integration</h1>
                    <p className="m-0 opacity-90">Manage email templates and send campaigns</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-white text-brand-primary px-4 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition"
                >
                    <FiPlus /> New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-10 text-center text-gray-500">Loading templates...</div>
                ) : templates.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-gray-500 bg-white rounded-xl shadow border border-gray-100">
                        No templates found. Create your first email template.
                    </div>
                ) : templates.map(template => (
                    <div key={template._id} className="bg-white rounded-[15px] shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
                        <div className="p-5 border-b border-gray-100 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-800 m-0 truncate pr-2">{template.name}</h3>
                                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                    {template.category}
                                </span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">Subject: {template.subject}</div>
                            <div className="text-xs text-gray-500 mb-4 line-clamp-3 bg-gray-50 p-3 rounded">
                                {template.body}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-auto">
                                {template.variables?.map((v: string) => (
                                    <span key={v} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-100">
                            <span className="text-xs text-gray-400">By {template.createdBy?.name || 'System'}</span>
                            <div className="flex gap-2">
                                <button className="p-1.5 text-gray-500 hover:text-brand-primary transition rounded" title="Edit">
                                    <FiEdit2 />
                                </button>
                                <button 
                                    onClick={() => handleDelete(template._id)}
                                    className="p-1.5 text-gray-500 hover:text-red-500 transition rounded" 
                                    title="Delete"
                                >
                                    <FiTrash2 />
                                </button>
                                <button 
                                    onClick={() => setSendModal({ isOpen: true, template })}
                                    className="ml-2 flex items-center gap-1 bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-brand-primary-dark transition"
                                >
                                    <FiSend /> Send
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Template Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                    <div className="bg-white p-6 rounded-xl w-[600px] shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">New Email Template</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Template Name</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none" placeholder="e.g. Welcome Email" />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none">
                                        <option value="marketing">Marketing</option>
                                        <option value="invoice">Invoice</option>
                                        <option value="support">Support</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line</label>
                                <input required type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none" placeholder="e.g. Welcome to Prodify, {{name}}!" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between">
                                    <span>HTML Body</span>
                                    <span className="text-xs font-normal text-gray-500 flex items-center gap-1"><FiCode /> Accepts HTML</span>
                                </label>
                                <textarea required rows={8} value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none font-mono text-sm" placeholder="<p>Hi {{name}},</p>..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Variables (comma separated)</label>
                                <input type="text" value={form.variables} onChange={e => setForm({...form, variables: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none" placeholder="e.g. {{name}}, {{company}}" />
                                <div className="text-xs text-gray-500 mt-1">Variables wrapped in curly braces will be replaced upon sending.</div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded font-bold hover:bg-brand-primary-dark">Save Template</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Email Modal */}
            {sendModal.isOpen && sendModal.template && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                    <div className="bg-white p-6 rounded-xl w-[500px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><FiMail /> Send "{sendModal.template.name}"</h2>
                            <button onClick={() => setSendModal({ isOpen: false, template: null })} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">To (Email Address)</label>
                                <input required type="email" name="to" className="w-full border border-gray-300 rounded p-2 focus:border-brand-primary outline-none" placeholder="customer@example.com" />
                            </div>
                            
                            {sendModal.template.variables && sendModal.template.variables.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
                                    <h4 className="font-bold text-sm text-gray-700">Variable Values</h4>
                                    {sendModal.template.variables.map((v: string) => (
                                        <div key={v}>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">{v}</label>
                                            <input required type="text" name={`var_${v}`} className="w-full border border-gray-300 rounded p-1.5 text-sm focus:border-brand-primary outline-none" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setSendModal({ isOpen: false, template: null })} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded font-bold hover:bg-brand-primary-dark flex items-center gap-2"><FiSend /> Send Email</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
