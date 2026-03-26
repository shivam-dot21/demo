'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiDollarSign, FiClock, FiActivity, FiX, FiUser, FiInfo, FiTag } from 'react-icons/fi';
import apiClient from '@/core/api/client';
import DocumentManager from '@/features/documents/components/DocumentManager';

const STAGES = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
];

const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost'
};

const STAGE_COLORS: Record<string, string> = {
  prospecting: 'bg-blue-50 border-blue-200',
  qualification: 'bg-indigo-50 border-indigo-200',
  proposal: 'bg-purple-50 border-purple-200',
  negotiation: 'bg-orange-50 border-orange-200',
  closed_won: 'bg-green-50 border-green-200',
  closed_lost: 'bg-red-50 border-red-200'
};

// Sortable Item Component
const SortableDealItem = ({ deal, onClick }: { deal: any, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={onClick}
      className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <div className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-brand-primary transition-colors">{deal.title}</div>
      <div className="text-xs text-gray-500 mb-2">{deal.customer?.name}</div>
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700">${deal.value?.toLocaleString()}</span>
        <span className={`px-2 py-0.5 rounded-full ${deal.probability >= 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {deal.probability}%
        </span>
      </div>
    </div>
  );
};

export default function PipelineManagement() {
    const [deals, setDeals] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedDeal, setSelectedDeal] = useState<any>(null);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchData = async () => {
        try {
            const [dealsRes, summaryRes] = await Promise.all([
                apiClient.get('/deals'),
                apiClient.get('/deals/pipeline/summary')
            ]);
            setDeals(dealsRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            console.error("Failed to fetch pipeline data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (!over) return;

        const dealId = active.id as string;
        const overId = over.id as string;

        // If dropped over a column container
        if (STAGES.includes(overId)) {
            const newStage = overId;
            const deal = deals.find(d => d._id === dealId);
            if (deal && deal.stage !== newStage) {
                // Optimistic UI update
                setDeals(deals.map(d => d._id === dealId ? { ...d, stage: newStage } : d));
                try {
                    await apiClient.put(`/deals/${dealId}`, { stage: newStage });
                    fetchData(); // Refresh summary
                } catch (err) {
                    console.error("Failed to update deal stage");
                    fetchData(); // Revert on failure
                }
            }
        } else {
             // Dropped over another item
             const activeDeal = deals.find(d => d._id === dealId);
             const overDeal = deals.find(d => d._id === overId);
             if (activeDeal && overDeal && activeDeal.stage !== overDeal.stage) {
                 const newStage = overDeal.stage;
                 setDeals(deals.map(d => d._id === dealId ? { ...d, stage: newStage } : d));
                 try {
                     await apiClient.put(`/deals/${dealId}`, { stage: newStage });
                     fetchData();
                 } catch (err) {
                     console.error("Failed to update deal stage");
                     fetchData();
                 }
             }
        }
    };

    const getDealsByStage = (stage: string) => deals.filter(d => d.stage === stage);

    const activeDeal = deals.find(d => d._id === activeId);

    return (
        <div className="p-7.5 max-w-[1600px] mx-auto min-h-[90vh] font-sans">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Sales Pipeline</h1>
                    <p className="m-0 opacity-90">Manage deals across different stages</p>
                </div>
                <button className="bg-white text-brand-primary px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-sm">
                    <FiPlus /> Add Deal
                </button>
            </div>

            {/* Pipeline Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6.25">
                {[
                    { label: 'Total Pipeline', value: `$${(summary.totalValue || 0).toLocaleString()}`, icon: <FiDollarSign className="text-emerald-500" /> },
                    { label: 'Deals Count', value: summary.totalDeals || 0, icon: <FiActivity className="text-blue-500" /> },
                    { label: 'Win Rate', value: `${(summary.winRate || 0).toFixed(1)}%`, icon: <FiClock className="text-amber-500" /> },
                    { label: 'Avg Deal Size', value: `$${(summary.avgDealSize || 0).toLocaleString()}`, icon: <FiDollarSign className="text-purple-500" /> }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[15px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl shadow-inner">
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-gray-400">{stat.label}</div>
                            <div className="text-xl font-black text-gray-800">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[60vh]">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCorners} 
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                    {STAGES.map(stage => {
                        const stageDeals = getDealsByStage(stage);
                        const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                        
                        return (
                            <div key={stage} className={`flex-1 min-w-[280px] w-[280px] rounded-[15px] p-4 border ${STAGE_COLORS[stage]} shadow-sm`}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-black text-gray-700 text-[10px] uppercase tracking-widest">{STAGE_LABELS[stage]}</h3>
                                    <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">{stageDeals.length}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-bold mb-4">${stageTotal.toLocaleString()}</div>
                                
                                <SortableContext id={stage} items={stageDeals.map(d => d._id)}>
                                    <div className="min-h-[150px] space-y-3">
                                        {stageDeals.map(deal => (
                                            <SortableDealItem 
                                                key={deal._id} 
                                                deal={deal} 
                                                onClick={() => setSelectedDeal(deal)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        );
                    })}

                    <DragOverlay>
                        {activeDeal ? (
                            <div className="bg-white p-3 rounded shadow-2xl border-2 border-brand-primary w-[260px] cursor-grabbing opacity-90 scale-105 rotate-2">
                                <div className="font-bold text-gray-800 text-sm mb-1">{activeDeal.title}</div>
                                <div className="text-xs text-gray-400 mb-2">{activeDeal.customer?.name}</div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-black text-brand-primary-dark">${activeDeal.value?.toLocaleString()}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold">{activeDeal.probability}%</span>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Deal Details Modal */}
            {selectedDeal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1500] flex items-center justify-center p-5">
                    <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl">
                                    <FiTag />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black m-0">{selectedDeal.title}</h2>
                                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Deal ID: {selectedDeal._id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedDeal(null)}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10 flex flex-col items-center text-center shadow-inner">
                                    <div className="text-3xl font-black text-brand-primary mb-1">${selectedDeal.value?.toLocaleString()}</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-gray-400">Total Value</div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="font-black text-gray-800 border-b border-gray-100 pb-2 text-xs uppercase tracking-widest">Deal Info</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiUser className="text-gray-400" />
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Customer</div>
                                                <div className="text-gray-700 font-bold">{selectedDeal.customer?.name || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiActivity className="text-gray-400" />
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Stage</div>
                                                <div className="text-gray-700 font-bold uppercase">{STAGE_LABELS[selectedDeal.stage]}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiInfo className="text-gray-400" />
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Probability</div>
                                                <div className="text-gray-700 font-bold">{selectedDeal.probability}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="lg:col-span-2 h-full flex flex-col">
                                <DocumentManager relatedTo="Deal" relatedId={selectedDeal._id} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
