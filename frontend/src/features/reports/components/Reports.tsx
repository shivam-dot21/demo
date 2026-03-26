'use client';

import React, { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import apiClient from '@/core/api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [dashRes, salesRes] = await Promise.all([
                apiClient.get('/analytics/dashboard'),
                apiClient.get('/analytics/sales')
            ]);
            setDashboardData(dashRes.data);
            setSalesData(salesRes.data);
        } catch (err) {
            console.error('Failed to load reports data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = (type: string) => {
        window.open(`http://localhost:5001/api/analytics/export?type=${type}`, '_blank');
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading reports...</div>;

    const lineChartData = {
        labels: salesData.map(d => d._id),
        datasets: [
            {
                label: 'Daily Sales ($)',
                data: salesData.map(d => d.totalSales),
                borderColor: 'rgba(56, 189, 248, 1)',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderWidth: 2,
                tension: 0.3,
            }
        ],
    };

    const ordersChartData = {
        labels: salesData.map(d => d._id),
        datasets: [
            {
                label: 'Orders Count',
                data: salesData.map(d => d.orderCount),
                backgroundColor: 'rgba(167, 139, 250, 0.6)',
            }
        ],
    };

    return (
        <div className="p-7.5 max-w-[1400px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Reports & Exports</h1>
                    <p className="m-0 opacity-90">View analytics and export system data</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('customers')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded font-bold flex items-center gap-2 border border-white/50 transition">
                        <FiDownload /> Customers
                    </button>
                    <button onClick={() => handleExport('orders')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded font-bold flex items-center gap-2 border border-white/50 transition">
                        <FiDownload /> Orders
                    </button>
                    <button onClick={() => handleExport('inventory')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded font-bold flex items-center gap-2 border border-white/50 transition">
                        <FiDownload /> Inventory
                    </button>
                </div>
            </div>

            <div className="flex gap-5 mb-7.5 flex-wrap">
                <div className="bg-white p-5 rounded-xl border border-gray-200 flex-1 min-w-[200px] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl"><FiUsers /></div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Total Customers</div>
                        <div className="text-2xl font-bold text-gray-800">{dashboardData?.totalCustomers}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 flex-1 min-w-[200px] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl"><FiDollarSign /></div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Monthly Revenue</div>
                        <div className="text-2xl font-bold text-gray-800">${dashboardData?.monthlyRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 flex-1 min-w-[200px] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl"><FiTrendingUp /></div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">New Cust (This Mo)</div>
                        <div className="text-2xl font-bold text-gray-800">{dashboardData?.newCustomers}</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-6">
                <div className="w-2/3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Sales Trend</h3>
                    <div className="h-[300px]">
                        <Line 
                            data={lineChartData} 
                            options={{ responsive: true, maintainAspectRatio: false }} 
                        />
                    </div>
                </div>
                <div className="w-1/3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Orders Volume</h3>
                    <div className="h-[300px]">
                        <Bar 
                            data={ordersChartData} 
                            options={{ responsive: true, maintainAspectRatio: false }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
