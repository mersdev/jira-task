import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, User } from './types';
import { Auth } from './components/Auth';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { Button, Input } from './components/UI';
import { api } from './services/api';
import { UserProfile } from './components/UserProfile';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Load tasks on authentication
  useEffect(() => {
    if (isAuthenticated) {
      const fetchTasks = async () => {
        setIsLoading(true);
        try {
          const data = await api.getTasks();
          setTasks(data);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTasks();
    }
  }, [isAuthenticated]);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    // We pass this to TaskModal which handles the await/loading state
    try {
        await api.updateTask(updatedTask);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (error) {
        console.error("Failed to update task", error);
        alert("Failed to save changes. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
        await api.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
        console.error("Failed to delete task", error);
        alert("Failed to delete task. Please try again.");
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic Update for Drag & Drop
    const originalTasks = [...tasks];
    const taskToMove = tasks.find(t => t.id === taskId);
    
    if (!taskToMove) return;

    const updatedTask = { ...taskToMove, status: newStatus };
    
    // 1. Update UI immediately
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    // 2. Call API
    try {
        await api.updateTask(updatedTask);
    } catch (error) {
        // 3. Rollback on error
        console.error("Failed to move task", error);
        setTasks(originalTasks);
        alert("Failed to move task. Reverting changes.");
    }
  };

  const handleCreateTask = async (status: TaskStatus) => {
    setIsCreating(true);
    const newTaskData = {
      title: 'New Issue',
      description: '',
      status: status,
      priority: TaskPriority.MEDIUM,
      createdAt: Date.now(),
      subtasks: [],
    };

    try {
        const createdTask = await api.createTask(newTaskData);
        setTasks(prev => [...prev, createdTask]);
        setSelectedTask(createdTask);
        setIsModalOpen(true);
    } catch (error) {
        console.error("Failed to create task", error);
        alert("Could not create new task.");
    } finally {
        setIsCreating(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      {/* Navbar */}
      <header className="border-b-2 border-black h-16 flex items-center justify-between px-4 md:px-6 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer">MONOTASK</div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowUserProfile(true)}
            className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-gray-800 uppercase overflow-hidden p-0 border-0"
            title={currentUser?.name}
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser?.name?.slice(0, 2) || 'ME'
            )}
          </button>
          <Button variant="ghost" onClick={handleLogout} className="text-xs px-2 hidden lg:flex">Logout</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Board Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0">
             <div className="flex items-center gap-4 flex-1">
                 <h1 className="text-lg md:text-xl font-bold whitespace-nowrap">Mono Board</h1>
                 
                 {isCreating && <span className="text-xs font-mono animate-pulse hidden md:inline ml-4">Creating...</span>}
                 {isLoading && <span className="text-xs font-mono animate-pulse hidden md:inline ml-4">Syncing...</span>}
                 
                 <div className="hidden md:flex -space-x-2 ml-4">
                     {['A', 'B', 'C'].map((u, i) => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold hover:z-10 relative cursor-pointer hover:bg-black hover:text-white transition-colors">
                             {u}
                         </div>
                     ))}
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold hover:bg-gray-200 cursor-pointer">+</div>
                 </div>
             </div>
             <div className="hidden md:block">
                 <span className="text-xs text-gray-400 mr-2">GROUP BY:</span>
                 <span className="font-bold text-sm underline cursor-pointer">None</span>
             </div>
          </div>

          <div className="p-4 md:px-6 border-b border-gray-200 bg-white">
            <Input 
                placeholder="Search tasks..." 
                className="w-full h-10 text-sm bg-gray-50 border-gray-300 focus:border-black transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto md:overflow-hidden bg-gray-100/50 relative">
            <div className="absolute inset-0 p-4 md:p-6 md:overflow-x-auto md:overflow-y-hidden">
                <div className="h-auto md:h-full">
                    {isLoading && tasks.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
                            <div className="font-mono text-sm font-bold">LOADING BOARD...</div>
                        </div>
                    </div>
                    ) : (
                        <TaskBoard 
                        tasks={filteredTasks}
                        onTaskClick={handleTaskClick}
                        onTaskMove={handleMoveTask}
                        onCreateTask={handleCreateTask}
                        />
                    )}
                </div>
            </div>
          </div>
        </main>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onAddSubtask={async (taskId, title) => {
            const updatedTask = await api.subtasks.create(taskId, title);
            setTasks(prev => prev.map(t => 
              t.id === taskId 
                ? { ...updatedTask, subtasks: updatedTask.subtasks.map(st => ({ ...st, key: st.id })) }
                : t
            ));
            return updatedTask;
          }}
          onDeleteSubtask={async (taskId, subtaskId) => {
            await api.subtasks.delete(taskId, subtaskId);
            setTasks(prev => prev.map(t => 
              t.id === taskId 
                ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId && st.key !== subtaskId) }
                : t
            ));
          }}
          onToggleSubtask={async (taskId, subtaskId, completed) => {
            const updatedTask = await api.subtasks.update(taskId, subtaskId, { completed });
            setTasks(prev => prev.map(t => 
              t.id === taskId 
                ? { ...updatedTask, subtasks: t.subtasks.map(st => {
                    const backendSubtask = updatedTask.subtasks.find(s => s.id === st.id);
                    return backendSubtask ? { ...backendSubtask, key: st.key || st.id } : st;
                  })}
                : t
            ));
            return updatedTask;
          }}
        />
      )}

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfile
          user={currentUser}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};