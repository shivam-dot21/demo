'use client';

import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function SupportDashboard() {
    const stats = [
        { label: 'Unassigned Tickets', value: '5', icon: <FaTicketAlt />, color: 'bg-red-500' },
        { label: 'Awaiting Response', value: '12', icon: <FaClock />, color: 'bg-amber-500' },
        { label: 'Resolved Today', value: '24', icon: <FaCheckCircle />, color: 'bg-emerald-500' },
        { label: 'Critical Escalations', value: '2', icon: <FaExclamationTriangle />, color: 'bg-purple-600' },
    ];

    return (
        <ProtectedRoute allowedRoles={['Support', 'admin']}>
            <MainLayout>
                <div className="p-6 font-sans">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 font-sans">Customer Support Dashboard</h1>
                        <p className="text-gray-500 font-medium">Manage incoming tickets and resolving customer issues efficiency.</p>
                    </header>

                    {/* Support Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-sans">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
                                <div className={`${stat.color} w-10 h-10 rounded-lg text-white flex items-center justify-center text-xl mb-4`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">{stat.value}</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                        {/* Urgent Tickets */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    High Priority Tickets
                                </h3>
                                <button className="text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-100 transition-colors">View All Tickets</button>
                            </div>
                            <div className="p-0">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-6 border-b border-gray-50 hover:bg-red-50/20 transition-colors flex justify-between items-center group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase text-red-600 tracking-tighter">Urgent</span>
                                                <span className="text-xs text-gray-400 font-medium">#TIC-1090{i}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 group-hover:text-red-700 transition-colors truncate">System Outage - Region {i === 1 ? 'North' : 'Central'} - Authentication Error</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">User report: "I cannot log into my account since the update last night. Getting 500 error on callback..."</p>
                                        </div>
                                        <button className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Reply Now</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CSAT Column */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Support Metrics</h3>
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-emerald-500 mb-1">4.8/5.0</div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Customer Satisfaction</p>
                                    <div className="flex justify-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-amber-400 text-lg">★</span>)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs font-bold text-gray-500">
                                            <span>AVG. RESPONSE TIME</span>
                                            <span className="text-emerald-600">12 MINS</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs font-bold text-gray-500">
                                            <span>RESOLUTION RATE</span>
                                            <span className="text-blue-600">94%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[94%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <p className="text-[11px] font-bold text-indigo-700 mb-2 uppercase italic">Pro-Tip for Today</p>
                                    <p className="text-xs text-indigo-900 leading-relaxed font-medium">Keep response times under 15 mins to maintain 4.8+ rating. Prioritize auth issues!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
