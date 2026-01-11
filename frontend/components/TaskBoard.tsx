import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { COLUMNS } from '../constants';
import { Card, Badge, Button } from './UI';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick, onTaskMove, onCreateTask }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onTaskMove(taskId, status);
    }
    setDraggedTaskId(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '↑';
      case 'MEDIUM': return '-';
      case 'LOW': return '↓';
      default: return '-';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-full gap-8 md:gap-6 pb-8 md:pb-0 md:px-0">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className="w-full md:w-80 flex-shrink-0 flex flex-col h-auto md:h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider bg-black text-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    {col.title} <span className="ml-2 opacity-60">{colTasks.length}</span>
                </h3>
            </div>

            <div className={`flex-1 bg-gray-50 border-2 border-dashed border-gray-300 p-2 space-y-3 transition-colors min-h-[150px] md:overflow-y-auto ${draggedTaskId ? 'bg-gray-100' : ''}`}>
               {colTasks.map(task => (
                   <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                   >
                       <Card onClick={() => onTaskClick(task)} className="group active:scale-95 transition-transform">
                           <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-mono text-gray-500 hover:text-black">{task.id}</span>
                               <div className="flex gap-1">
                                    <span className="w-5 h-5 flex items-center justify-center border border-black text-xs font-bold" title="Priority">
                                        {getPriorityIcon(task.priority)}
                                    </span>
                               </div>
                           </div>
                           <p className="text-sm font-medium leading-tight mb-3 group-hover:underline decoration-1 underline-offset-2">
                               {task.title}
                           </p>
                           <div className="flex items-center justify-between mt-auto">
                               {task.subtasks.length > 0 && (
                                   <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                       <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                                   </div>
                               )}
                           </div>
                       </Card>
                   </div>
               ))}
               <button 
                onClick={() => onCreateTask(col.id)}
                className="w-full py-3 text-center text-sm text-gray-400 hover:text-black hover:bg-white border border-transparent hover:border-black transition-all font-mono dashed"
               >
                   + Create Issue
               </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};