import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, Subtask } from '../types';
import { Button, Textarea, Input, Modal } from './UI';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<Task>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<Task>;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete, onAddSubtask, onDeleteSubtask, onToggleSubtask }) => {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(editedTask);
      onClose();
    } catch (e) {
      // Error handled in App parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
     if(window.confirm('Are you sure you want to delete this issue?')) {
        setIsDeleting(true);
        try {
            await onDelete(task.id);
            onClose();
        } catch(e) {
            // Error handled in parent
        } finally {
            setIsDeleting(false);
        }
     }
  };

  const toggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    const subtask = editedTask.subtasks.find(st => st.id === subtaskId || st.key === subtaskId);
    if (!subtask) return;

    try {
      const updatedTask = await onToggleSubtask(task.id, subtask.id, !currentCompleted);
      setEditedTask(prev => ({
        ...updatedTask,
        subtasks: updatedTask.subtasks.map(s => ({ ...s, key: s.id }))
      }));
    } catch (error) {
      console.error('Failed to update subtask:', error);
      alert('Failed to update subtask. Please try again.');
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    const subtask = editedTask.subtasks.find(st => st.id === subtaskId || st.key === subtaskId);
    if (!subtask) return;

    try {
      await onDeleteSubtask(task.id, subtask.id);
      setEditedTask(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter(st => st.id !== subtask.id && st.key !== subtask.id)
      }));
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      alert('Failed to delete subtask. Please try again.');
    }
  };

  const addSubtask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val) {
        e.currentTarget.value = '';
        const tempKey = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempSubtask: Subtask = {
          id: tempKey,
          key: tempKey,
          title: val,
          completed: false
        };
        
        setEditedTask(prev => ({
          ...prev,
          subtasks: [...prev.subtasks, tempSubtask]
        }));

        try {
          const updatedTask = await onAddSubtask(task.id, val);
          const backendSubtasks = updatedTask.subtasks ?? [];

          setEditedTask(prev => ({
            ...updatedTask,
            subtasks: prev.subtasks.map(st => {
              const backendSubtask = backendSubtasks.find(s => s.id === st.id || s.id === tempKey);
              if (backendSubtask) {
                return { ...backendSubtask, key: st.key || backendSubtask.id };
              }
              return st;
            })
          }));
        } catch (error) {
          console.error('Failed to add subtask:', error);
          setEditedTask(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(st => st.key !== tempKey)
          }));
          alert('Failed to add subtask. Please try again.');
        }
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.id.toUpperCase()}>
      <div className="flex flex-col h-full overflow-hidden">
         {/* Scrollable Content */}
         <div className="flex-1 overflow-y-auto p-8">
              {/* Title Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Input 
                      value={editedTask.title} 
                      onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="text-3xl font-black border-0 border-b-4 border-black focus:ring-0 px-0 rounded-none bg-transparent h-auto pb-2 placeholder-gray-300 flex-grow"
                      placeholder="Issue Title"
                  />
                  <button
                    onClick={() => {
                      setEditedTask(prev => ({
                        ...prev,
                        title: 'Sample Task Title',
                        description: 'This is a sample description for the task. It provides more details about what needs to be done.',
                        priority: 'MEDIUM' as any
                      }));
                    }}
                    className="text-xs font-mono px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                    title="Autofill sample data"
                  >
                    AUTOFILL
                  </button>
                </div>
              </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Description */}
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-gray-400 font-mono">Description</label>
                       <Textarea 
                         value={editedTask.description} 
                         onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                         rows={8}
                         className="bg-gray-50 focus:bg-white transition-colors border-dashed"
                         placeholder="Add a detailed description..."
                       />
                    </div>

                    {/* Subtasks */}
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Subtasks</label>
                          <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">
                            {editedTask.subtasks.filter(s => s.completed).length} / {editedTask.subtasks.length}
                          </span>
                       </div>
                       
                       {/* Progress bar */}
                       <div className="w-full h-3 bg-gray-100 mb-6 border-2 border-black overflow-hidden relative">
                          <div 
                            className="h-full bg-black transition-all duration-300"
                            style={{ width: `${(editedTask.subtasks.filter(s => s.completed).length / (editedTask.subtasks.length || 1)) * 100}%` }}
                          />
                          {/* Stripe pattern overlay */}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
                       </div>
                       
                        <div className="space-y-3">
                           {editedTask.subtasks.map(st => (
                             <div key={st.key || st.id} className="flex items-start gap-4 group p-3 hover:bg-gray-50 border border-transparent hover:border-black transition-all">
                                 <div className="relative flex items-center mt-0.5">
                                   <input 
                                      type="checkbox" 
                                      checked={st.completed} 
                                      onChange={() => toggleSubtask(st.id, st.completed)}
                                      className="appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-black cursor-pointer transition-colors"
                                   />
                                  <svg className={`absolute top-1 left-1 w-3 h-3 text-white pointer-events-none ${st.completed ? 'block' : 'hidden'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                
                                <div className={`flex-grow text-sm font-medium pt-0.5 ${st.completed ? 'line-through text-gray-400' : 'text-black'}`}>
                                   {st.title}
                                </div>
                                <button onClick={() => deleteSubtask(st.id)} className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                             </div>
                           ))}
                        </div>
                       <div className="mt-4">
                         <Input 
                            placeholder="+ Add a subtask (Press Enter)" 
                            onKeyDown={addSubtask}
                            className="text-sm border-dashed hover:border-solid bg-transparent"
                         />
                       </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-shadow">
                       <h3 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Properties</h3>
                       
                       <div className="space-y-6">
                            <div>
                               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Status</label>
                               <div className="relative">
                                   <select 
                                     value={editedTask.status} 
                                     onChange={(e) => setEditedTask({...editedTask, status: e.target.value as any})}
                                     className="w-full p-2 pl-3 text-sm bg-white border-2 border-black font-bold appearance-none cursor-pointer hover:bg-gray-50 focus:bg-black focus:text-white transition-colors"
                                   >
                                       <option value="TODO">To Do</option>
                                       <option value="IN_PROGRESS">In Progress</option>
                                       <option value="DONE">Done</option>
                                   </select>
                                   <div className="absolute right-3 top-3 pointer-events-none">
                                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-current"><path d="M6 9l6 6 6-6"/></svg>
                                   </div>
                               </div>
                            </div>

                           <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Priority</label>
                              <div className="flex flex-col gap-2">
                                {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                   <button
                                    key={p}
                                    onClick={() => setEditedTask({...editedTask, priority: p as any})}
                                    className={`w-full px-3 py-2 text-xs font-bold border-2 border-black flex items-center justify-between transition-all group ${
                                        editedTask.priority === p 
                                        ? 'bg-black text-white' 
                                        : 'bg-white text-black hover:translate-x-1'
                                    }`}
                                   >
                                     <span>{p}</span>
                                     {editedTask.priority === p && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                   </button>
                                ))}
                              </div>
                           </div>
                       </div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono text-center">
                        CREATED: {new Date(editedTask.createdAt).toLocaleString()}
                    </div>

                    <Button 
                        variant="outline" 
                        className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white justify-center py-3" 
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        disabled={isSaving}
                    >
                        DELETE ISSUE
                    </Button>
                </div>
             </div>
         </div>

         {/* Sticky Footer */}
         <div className="flex justify-between items-center px-8 py-4 border-t-2 border-black bg-white z-10">
            <div className="text-xs font-mono text-gray-400">
                Changes saved via API
            </div>
            <div className="flex gap-4">
                <Button variant="ghost" onClick={onClose} className="font-bold" disabled={isSaving || isDeleting}>CANCEL</Button>
                <Button 
                    onClick={handleSave} 
                    isLoading={isSaving}
                    disabled={isDeleting}
                    className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none min-w-[120px]"
                >
                    SAVE
                </Button>
            </div>
         </div>
      </div>
    </Modal>
  );
};