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
import { FiPlus, FiDollarSign, FiClock, FiActivity } from 'react-icons/fi';
import apiClient from '@/core/api/client';

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
const SortableDealItem = ({ deal }: { deal: any }) => {
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
      className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="font-semibold text-gray-800 text-sm mb-1">{deal.title}</div>
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

    const sensors = useSensors(
      useSensor(PointerSensor),
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
        <div className="p-7.5 max-w-[1600px] mx-auto min-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-6.25 rounded-[15px] shadow-lg mb-6.25 flex justify-between items-center">
                <div>
                    <h1 className="m-0 mb-2.5 text-[32px] font-bold">Sales Pipeline</h1>
                    <p className="m-0 opacity-90">Manage deals across different stages</p>
                </div>
                <button className="bg-white text-brand-primary px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                    <FiPlus /> Add Deal
                </button>
            </div>

            {/* Pipeline Summary */}
            <div className="grid grid-cols-4 gap-5 mb-6.25">
                {[
                    { label: 'Total Pipeline', value: `$${(summary.totalValue || 0).toLocaleString()}`, icon: '💰' },
                    { label: 'Deals Count', value: summary.totalDeals || 0, icon: '📊' },
                    { label: 'Win Rate', value: `${(summary.winRate || 0).toFixed(1)}%`, icon: '🏆' },
                    { label: 'Avg Deal Size', value: `$${(summary.avgDealSize || 0).toLocaleString()}`, icon: '📈' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[15px] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="text-3xl">{stat.icon}</div>
                        <div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                            <div className="text-xl font-bold text-gray-800">{stat.value}</div>
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
                            <div key={stage} className={`flex-1 min-w-[280px] w-[280px] rounded-[10px] p-3 border ${STAGE_COLORS[stage]}`}>
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{STAGE_LABELS[stage]}</h3>
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{stageDeals.length}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium mb-3 px-1">${stageTotal.toLocaleString()}</div>
                                
                                <SortableContext id={stage} items={stageDeals.map(d => d._id)}>
                                    <div className="min-h-[150px]">
                                        {stageDeals.map(deal => (
                                            <SortableDealItem key={deal._id} deal={deal} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        );
                    })}

                    <DragOverlay>
                        {activeDeal ? (
                            <div className="bg-white p-3 rounded shadow-xl border border-brand-primary w-[260px] cursor-grabbing opacity-90 scale-105 rotate-2">
                                <div className="font-semibold text-gray-800 text-sm mb-1">{activeDeal.title}</div>
                                <div className="text-xs text-gray-500 mb-2">{activeDeal.customer?.name}</div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700">${activeDeal.value?.toLocaleString()}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">{activeDeal.probability}%</span>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
