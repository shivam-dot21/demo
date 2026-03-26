'use client';

import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import { FaUsers, FaChartBar, FaHistory, FaProjectDiagram } from 'react-icons/fa';

export default function ManagerDashboard() {
    const stats = [
        { label: 'Team Size', value: '8 Members', icon: <FaUsers />, color: 'bg-indigo-500' },
        { label: 'Monthly Sales', value: '$124,500', icon: <FaChartBar />, color: 'bg-emerald-500' },
        { label: 'Active Projects', value: '12', icon: <FaProjectDiagram />, color: 'bg-amber-500' },
        { label: 'System Activities', value: '452', icon: <FaHistory />, color: 'bg-gray-500' },
    ];

    return (
        <ProtectedRoute allowedRoles={['Manager', 'admin']}>
            <MainLayout>
                <div className="p-6 font-sans">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Sales Manager Dashboard</h1>
                        <p className="text-gray-500">Monitor team velocity and internal operations.</p>
                    </header>

                    {/* Manager Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-sans">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className={`${stat.color} p-4 rounded-xl text-white text-xl shadow-md flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                Team Performance
                            </h3>
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-gray-700">Agent {i} - Region {i % 2 === 0 ? 'West' : 'East'}</span>
                                            <span className="text-gray-500">{70 + i * 5}% Target Achieved</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                                                style={{ width: `${70 + i * 5}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-gray-500 rounded-full"></span>
                                Recent Activity Logs
                            </h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="py-3 border-b border-gray-50 last:border-0 flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 underline decoration-indigo-200">Order #ORD-12{i}1 was updated</p>
                                            <p className="text-[10px] text-gray-400">Action by Agent {i} • 15 mins ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
