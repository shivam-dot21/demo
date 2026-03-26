'use client';

import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiPlus, FiSearch, FiCheckCircle, FiClock, FiAlertCircle, FiSend } from 'react-icons/fi';
import apiClient from '@/core/api/client';
import { useAuth } from '@/providers/AuthProvider';

export default function TicketsManagement() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [replyMsg, setReplyMsg] = useState('');

    const fetchTickets = async () => {
        try {
            const res = await apiClient.get('/tickets');
            setTickets(res.data);
            if (selectedTicket) {
                const updated = res.data.find((t: any) => t._id === selectedTicket._id);
                if (updated) fetchTicketDetail(updated._id);
            }
        } catch (err) {
            console.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetail = async (id: string) => {
        try {
            const res = await apiClient.get(`/tickets/${id}`);
            setSelectedTicket(res.data);
        } catch (err) {
            console.error('Failed to fetch ticket detail');
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMsg.trim() || !selectedTicket) return;
        try {
            const res = await apiClient.post(`/tickets/${selectedTicket._id}/messages`, {
                message: replyMsg,
                isInternal: false
            });
            setReplyMsg('');
            // Optional: update just the messages in state or fetch all
            fetchTicketDetail(selectedTicket._id);
            fetchTickets();
        } catch (err) {
            console.error('Failed to send reply');
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await apiClient.put(`/tickets/${id}`, { status: newStatus });
            fetchTickets();
            if (selectedTicket && selectedTicket._id === id) {
                fetchTicketDetail(id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <FiAlertCircle className="text-orange-500" />;
            case 'in_progress': return <FiClock className="text-blue-500" />;
            case 'resolved': return <FiCheckCircle className="text-green-500" />;
            case 'closed': return <FiCheckCircle className="text-gray-500" />;
            default: return <FiAlertCircle className="text-gray-500" />;
        }
    };

    const filteredTickets = tickets.filter(t => 
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Support Tickets</h1>
                    <p className="m-0 opacity-90">Manage and respond to customer support requests</p>
                </div>
                <button className="bg-white text-brand-primary px-4 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                    <FiPlus /> New Ticket
                </button>
            </div>

            <div className="flex gap-6 h-[calc(100vh-280px)]">
                {/* Tickets List */}
                <div className="w-1/3 bg-white rounded-[15px] shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-primary"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading tickets...</div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">No tickets found</div>
                        ) : filteredTickets.map(ticket => (
                            <div 
                                key={ticket._id} 
                                onClick={() => fetchTicketDetail(ticket._id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition ${selectedTicket?._id === ticket._id ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{ticket.subject}</h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <div className="text-sm text-gray-600 line-clamp-1">{ticket.customer?.name}</div>
                                    <div className="flex items-center gap-1 text-xs font-bold capitalize">
                                        {getStatusIcon(ticket.status)} {ticket.status.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Detail / Conversation */}
                <div className="w-2/3 bg-white rounded-[15px] shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-gray-800 m-0">{selectedTicket.subject}</h2>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                                            selectedTicket.priority === 'high' || selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            {selectedTicket.priority}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 flex gap-4">
                                        <span><FiMessageSquare className="inline mr-1"/> {selectedTicket.ticketNumber}</span>
                                        <span>Customer: <strong>{selectedTicket.customer?.name}</strong></span>
                                        <span>Status: <strong className="capitalize">{selectedTicket.status.replace('_', ' ')}</strong></span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                                        <button 
                                            onClick={() => updateStatus(selectedTicket._id, 'resolved')}
                                            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 font-bold rounded hover:bg-green-200"
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 space-y-6">
                                {/* Original Ticket Description */}
                                <div className="flex flex-col items-start max-w-[80%]">
                                    <div className="text-xs text-gray-500 ml-2 mb-1">{selectedTicket.customer?.name} (Customer)</div>
                                    <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedTicket.messages?.map((msg: any, idx: number) => {
                                    const isMe = msg.sender?._id === user?.id || (msg.sender && typeof msg.sender === 'string' && msg.sender === user?.id) || false;
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isMe ? 'ml-auto max-w-[80%]' : 'max-w-[80%]'}`}>
                                            <div className={`text-xs text-gray-500 mb-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
                                                {msg.senderName || msg.sender?.name || 'Agent'} 
                                                <span className="opacity-50 ml-2">{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-white">
                                <form onSubmit={handleSendReply} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={replyMsg}
                                        onChange={e => setReplyMsg(e.target.value)}
                                        placeholder="Type your reply here..." 
                                        className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                        disabled={selectedTicket.status === 'closed'}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!replyMsg.trim() || selectedTicket.status === 'closed'}
                                        className="bg-brand-primary text-white px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-brand-primary-dark transition disabled:opacity-50"
                                    >
                                        <FiSend /> Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10">
                            <FiMessageSquare className="text-6xl mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">No Ticket Selected</h3>
                            <p className="text-center">Select a ticket from the list to view its details and message history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
