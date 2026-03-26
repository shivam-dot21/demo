'use client';

import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import { FaUserPlus, FaHandshake, FaTasks, FaBullseye } from 'react-icons/fa';

export default function SalesDashboard() {
    const stats = [
        { label: 'Leads Assigned', value: '12', icon: <FaUserPlus />, color: 'bg-orange-500' },
        { label: 'Open Deals', value: '8', icon: <FaHandshake />, color: 'bg-blue-500' },
        { label: 'Tasks Pending', value: '5', icon: <FaTasks />, color: 'bg-red-500' },
        { label: 'Sales Target', value: '75%', icon: <FaBullseye />, color: 'bg-emerald-500' },
    ];

    return (
        <ProtectedRoute allowedRoles={['Sales', 'admin']}>
            <MainLayout>
                <div className="p-6 font-sans">
                    <header className="mb-8 font-sans">
                        <h1 className="text-3xl font-bold text-gray-800">Sales Representative Dashboard</h1>
                        <p className="text-gray-500 font-medium">Focus on your pipeline and conversion targets.</p>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-sans">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer">
                                <div>
                                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                        {/* Leads Column */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Your Sales Pipeline</h3>
                                <button className="text-sm text-blue-600 font-semibold hover:underline">View All Deals</button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:border-blue-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">L</div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Potential High-Value Client {i}</h4>
                                                <p className="text-xs text-gray-500">Last touched: 2 hours ago</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-800">$4,500</div>
                                            <div className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full inline-block font-bold">Negotiation</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tasks Column */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Upcoming Tasks</h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                        <input type="checkbox" className="mt-1 accent-blue-600 h-4 w-4" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Follow up with Client {i + 10}</span>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Today at 2:00 PM</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                Add New Task
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
