'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaHome, FaBox, FaListAlt, FaShoppingCart, FaUsers, FaChartLine, FaCog, FaQuestionCircle, FaInfoCircle, FaUserShield, FaTasks } from "react-icons/fa";
import { SiMarketo } from "react-icons/si";
import { useAuth } from '@/providers/AuthProvider';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const router = useRouter();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const { user } = useAuth();

    const baseMenuItems = [
        { name: "Dashboard", icon: <FaHome />, path: "/" },
        { name: "Inventory", icon: <FaBox />, path: "/inventory" },
        { name: "Orders", icon: <FaShoppingCart />, path: "/orders" },
        { name: "Tenders", icon: <SiMarketo />, path: "/tenders" },
        { name: "Products", icon: <FaListAlt />, path: "/products" },
        { name: "Tasks", icon: <FaTasks />, path: "/tasks" },
        { name: "Customers", icon: <FaUsers />, path: "/customers" },
        { name: "Reports", icon: <FaChartLine />, path: "/reports" },
        { name: "Analytics", icon: <FaChartLine />, path: "/analytics" },
        { name: "About", icon: <FaInfoCircle />, path: "/about" },
        { name: "Support", icon: <FaQuestionCircle />, path: "/support" },
        { name: "Settings", icon: <FaCog />, path: "/settings" },
    ];

    const menuItems = user?.role === 'admin'
        ? [...baseMenuItems, { name: "Admin Panel", icon: <FaUserShield />, path: "/admin" }]
        : baseMenuItems;

    return (
        <div
            className="flex flex-col bg-[#222121] rounded-2xl py-5 px-2.5 transition-all duration-300 ease-in-out mt-2.5"
            style={{
                height: "85vh",
                width: isOpen ? "150px" : "40px"
            }}
        >
            {/* USER INFO */}
            <div
                onClick={() => router.push("/profile")}
                className="cursor-pointer mb-7.5 flex items-center gap-3 text-white p-1.25 rounded-lg transition-colors hover:bg-white/5"
            >
                {user?.avatar ? (
                    <img
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-brand-primary"
                    />
                ) : (
                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}

                {isOpen && (
                    <div className="overflow-hidden">
                        <div className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                            {user?.name || "User"}
                        </div>
                        <div className="text-[11px] text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis">
                            {user?.email || "Guest"}
                        </div>
                    </div>
                )}
            </div>

            {/* MENU ITEMS */}
            {menuItems.map((item) => (
                <div
                    key={item.name}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center gap-3.5 p-3 cursor-pointer rounded-lg text-base transition-all duration-200 text-white
                        ${hoveredItem === item.name ? 'bg-brand-primary border-l-4 border-l-brand-primary-dark/50' : 'bg-transparent border-l-0'}`}
                >
                    {item.icon}
                    {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
