import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getUserTasks, updateTaskStatus } from '../../api';
import { socketService } from '../../socket';
import { useAuth } from '../../AuthContext';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Briefcase
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EmployeeTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadTasks();

            // Connect WebSocket
            socketService.connect(user.id);
            const unsubscribe = socketService.subscribe((data) => {
                if (data.type === 'task_assigned') {
                    // Add new task to list or refresh
                    setTasks(prev => [data.task, ...prev]);
                    alert(`New Task Assigned: ${data.task.title}`);
                }
            });

            return () => {
                unsubscribe();
                socketService.disconnect();
            };
        }
    }, [user]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await getUserTasks(user.id);
            if (data.success) {
                setTasks(data.tasks || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const res = await updateTaskStatus(taskId, newStatus);
            if (res.success) {
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, status: newStatus } : t
                ));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    return (
        <DashboardLayout
            title="My Tasks"
            subtitle="Track your assigned tasks and deadlines."
            sidebarTitle="Employee Portal"
        >
            {loading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.length === 0 ? (
                        <div className="col-span-3 text-center py-10 text-muted">
                            <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No tasks assigned yet. Enjoy your day!</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                        {task.priority} Priority
                                    </span>
                                    {task.status === 'Completed' ? (
                                        <span className="text-green-600 flex items-center gap-1 text-sm font-bold">
                                            <CheckCircle size={16} /> Done
                                        </span>
                                    ) : (
                                        <span className="text-purple-600 text-sm font-bold">
                                            {task.status}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold mb-2 text-primary">{task.title}</h3>
                                <p className="text-secondary text-sm mb-4 line-clamp-2">
                                    {task.description || 'No description provided.'}
                                </p>

                                <div className="text-xs text-muted mb-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>Due: {new Date(task.deadline).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={14} />
                                        <span>Assigned By: Admin</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-light flex gap-2">
                                    {task.status !== 'Completed' && (
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'Completed')}
                                            className="btn btn-primary flex-1 text-sm py-2"
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                    {task.status === 'Pending' && (
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'In Progress')}
                                            className="btn btn-secondary flex-1 text-sm py-2"
                                        >
                                            Start Work
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default EmployeeTasks;
