'use client';

import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiCalendar, FiList, FiPlus } from 'react-icons/fi';
import apiClient from '@/core/api/client';

export default function TasksManagement() {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await apiClient.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const completeTask = async (id: string) => {
        try {
            await apiClient.put(`/tasks/${id}/complete`);
            fetchTasks();
        } catch (err) {
            console.error('Failed to complete task');
        }
    };

    const isOverdue = (date: string) => new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();

    return (
        <div className="p-7.5 max-w-[1200px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Tasks & Activities</h1>
                    <p className="m-0 opacity-90">Manage your daily calls, emails, and meetings</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-white/20 p-1 rounded-lg flex">
                        <button 
                            className={`px-4 py-2 rounded-md font-medium transition ${view === 'list' ? 'bg-white text-brand-primary' : 'text-white'}`}
                            onClick={() => setView('list')}
                        >
                            <FiList className="inline mr-2" /> List
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-md font-medium transition ${view === 'calendar' ? 'bg-white text-brand-primary' : 'text-white'}`}
                            onClick={() => setView('calendar')}
                        >
                            <FiCalendar className="inline mr-2" /> Calendar
                        </button>
                    </div>
                    <button className="bg-white text-brand-primary px-4 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                        <FiPlus /> Add Task
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-10">Loading tasks...</div>
            ) : view === 'list' ? (
                <div className="bg-white rounded-[15px] shadow-md border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                            <tr>
                                <th className="p-4 w-12"></th>
                                <th className="p-4">Task</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => completeTask(task._id)}
                                            className={`text-2xl transition-colors rounded-full leading-none ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-brand-primary'}`}
                                        >
                                            <FiCheckCircle />
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                            {task.title}
                                        </div>
                                    </td>
                                    <td className="p-4 capitalize text-gray-600">{task.type?.replace('_', ' ')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-2 ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                            <FiClock />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{task.assignedTo?.name || 'Unassigned'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-[15px] shadow-md border border-gray-200 p-6 text-center text-gray-500 py-20">
                    <FiCalendar className="text-6xl mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">Calendar View Details</h3>
                    <p>Calendar rendering would be implemented here using date tracking logic.</p>
                </div>
            )}
        </div>
    );
}
