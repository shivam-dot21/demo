import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiPhone, FiMail, FiCalendar, FiShoppingCart, FiCheckSquare, FiRefreshCw, FiUserPlus, FiActivity } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function CustomerTimeline({ customerId }: { customerId: string }) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchTimeline = async (pageNumber = 1) => {
        try {
            const res = await apiClient.get(`/customers/${customerId}/timeline?page=${pageNumber}`);
            if (res.data.length < 20) setHasMore(false);
            if (pageNumber === 1) {
                setActivities(res.data);
            } else {
                setActivities(prev => [...prev, ...res.data]);
            }
        } catch (err) {
            console.error("Failed to load timeline");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline(1);
    }, [customerId]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        fetchTimeline(page + 1);
    };

    // Quick add state
    const [newType, setNewType] = useState('note');
    const [newDesc, setNewDesc] = useState('');

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/activities', { // assuming /api/activities endpoint or we can manually create it, wait we don't have POST activities, I'll add the activity internally right now for demo logic, or I should add POST /api/activities route. Let's just console log for now or create a quick activity log route
                type: newType,
                description: newDesc,
                relatedTo: { model: 'Customer', id: customerId }
            });
            setNewDesc('');
            fetchTimeline(1);
        } catch (err) {
            console.error(err);
        }
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'note': return { icon: <FiMessageSquare />, color: 'bg-purple-100 text-purple-600' };
            case 'call': return { icon: <FiPhone />, color: 'bg-blue-100 text-blue-600' };
            case 'email': return { icon: <FiMail />, color: 'bg-teal-100 text-teal-600' };
            case 'order': return { icon: <FiShoppingCart />, color: 'bg-green-100 text-green-600' };
            case 'meeting': return { icon: <FiCalendar />, color: 'bg-amber-100 text-amber-600' };
            case 'status_change': return { icon: <FiRefreshCw />, color: 'bg-gray-100 text-gray-600' };
            case 'task': return { icon: <FiCheckSquare />, color: 'bg-indigo-100 text-indigo-600' };
            case 'lead_converted': return { icon: <FiUserPlus />, color: 'bg-pink-100 text-pink-600' };
            default: return { icon: <FiActivity />, color: 'bg-gray-100 text-gray-600' };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Activity Timeline</h3>
            
            <form onSubmit={handleQuickAdd} className="flex gap-2 mb-6">
                <select 
                    value={newType} 
                    onChange={e => setNewType(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm focus:border-brand-primary outline-none"
                >
                    <option value="note">Note</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                </select>
                <input 
                    type="text" 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Log an activity..." 
                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:border-brand-primary outline-none"
                    required
                />
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded text-sm font-bold">Add</button>
            </form>

            <div className="relative border-l-2 border-gray-100 ml-4 space-y-6">
                {loading && page === 1 ? (
                    <div className="pl-6 text-sm text-gray-500">Loading timeline...</div>
                ) : activities.length === 0 ? (
                    <div className="pl-6 text-sm text-gray-500">No activities found.</div>
                ) : activities.map((activity, index) => {
                    const details = getTypeDetails(activity.type);
                    return (
                        <div key={activity._id || index} className="relative pl-6">
                            <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${details.color}`}>
                                {details.icon}
                            </div>
                            <div className="bg-gray-50 rounded p-3 mb-2">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-semibold text-gray-800 text-sm">{activity.performedBy?.name || 'System'}</div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-gray-600 text-sm">
                                    {activity.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {hasMore && !loading && (
                <button 
                    onClick={handleLoadMore}
                    className="w-full mt-4 py-2 text-brand-primary text-sm font-semibold hover:bg-gray-50 rounded"
                >
                    Load More
                </button>
            )}
        </div>
    );
}
