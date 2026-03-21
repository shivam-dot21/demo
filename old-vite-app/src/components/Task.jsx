import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCheckCircle, FiClock, FiTruck, FiXCircle } from "react-icons/fi";

const Task = () => {
    const [activeTab, setActiveTab] = useState("All");

    const containerStyle = {
        padding: '30px',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '90vh'
    };

    const cardStyle = {
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0',
        marginBottom: '25px'
    };

    const statusColors = {
        'Processing': { bg: '#eff6ff', text: '#1d4ed8', icon: <FiClock /> },
        'Pending': { bg: '#f3f4f6', text: '#374151', icon: <FiClock /> },
    };

    const taskList = [
        { id: 1, title: 'Design Landing Page', status: 'Pending' },
        { id: 2, title: 'API Integration', status: 'Processing' },
    ];

    const handleOpenTask = (id) => {
        console.log("Open Task:", id);
    };

    const handleAddTask = () => {
        usenavigate('/task/add');

    };

    // ✅ Filter Logic
    const filteredTasks =
        activeTab === "All"
            ? taskList
            : taskList.filter(task => task.status === activeTab);

    return (
        <div style={containerStyle}>

            {/* Header */}
            <div style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #3cb2a8 0%, #2a8a81 100%)',
                color: 'white',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Tasks</h1>
                    <p style={{ margin: '0', opacity: '0.9' }}>
                        Capture your thoughts and tasks instantly
                    </p>
                </div>

                <button
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid white',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                onClick={() => handleAddTask()} >
                    <FiPlus size={18} /> New Task
                </button>
            </div>

            {/* ✅ Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                {['All', 'Pending', 'Processing']
                    .map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 25px',
                                borderRadius: '30px',
                                border: 'none',
                                backgroundColor: activeTab === tab ? '#3cb2a8' : '#f3f4f6',
                                color: activeTab === tab ? 'white' : '#555',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: activeTab === tab
                                    ? '0 4px 12px rgba(60,178,168,0.3)'
                                    : '0 2px 5px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
            </div>

            {/* Task List */}
            <div style={cardStyle}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredTasks.map((task) => (
                        <li
                            key={task.id}
                            onClick={() => handleOpenTask(task.id)}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                borderRadius: '10px',
                                marginBottom: '10px',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span style={{ fontWeight: '500' }}>
                                {task.title}
                            </span>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: statusColors[task.status].bg,
                                color: statusColors[task.status].text,
                                width: 'fit-content'
                            }}>
                                {statusColors[task.status].icon}
                                {task.status}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default Task;
