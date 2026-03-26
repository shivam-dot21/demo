'use client';

import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import { FaDollarSign, FaUsers, FaChartLine, FaBoxOpen } from 'react-icons/fa';

export default function CEODashboard() {
    const stats = [
        { label: 'Total Revenue', value: '$452,105', icon: <FaDollarSign />, color: 'bg-emerald-500' },
        { label: 'Total Customers', value: '1,284', icon: <FaUsers />, color: 'bg-blue-500' },
        { label: 'Active Deals', value: '48', icon: <FaChartLine />, color: 'bg-purple-500' },
        { label: 'Top Product', value: 'Enterprise CRM', icon: <FaBoxOpen />, color: 'bg-orange-500' },
    ];

    return (
        <ProtectedRoute allowedRoles={['CEO', 'admin']}>
            <MainLayout>
                <div className="p-6 font-sans">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">CEO Executive Dashboard</h1>
                        <p className="text-gray-500">Welcome back, here's a summary of your business performance.</p>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className={`${stat.color} p-4 rounded-xl text-white text-2xl`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Analytics</h3>
                            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                                [Chart Visualization Placeholder]
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performing Products</h3>
                            <ul className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <li key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">{i}</div>
                                            <span className="font-medium text-gray-700">Product {i} Service Bundle</span>
                                        </div>
                                        <span className="font-bold text-emerald-600">$12,400</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
