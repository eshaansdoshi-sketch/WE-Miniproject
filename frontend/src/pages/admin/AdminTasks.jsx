import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { createTask, getCreatedTasks, getProfiles } from '../../api';
import { useAuth } from '../../AuthContext';
import {
    Briefcase,
    Plus,
    User,
    X,
    CheckCircle,
    Clock,
    Search
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminTasks = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        deadline: '',
        attachment_url: ''
    });

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Employees
            const empData = await getProfiles('employee');
            if (empData.success) {
                setEmployees(empData.profiles || []);
            }

            // Fetch Tasks
            const taskData = await getCreatedTasks(user.id);
            if (taskData.success) {
                setTasks(taskData.tasks || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeClick = (emp) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
        setError(null);
        setSuccessMsg('');
        // Reset form
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            deadline: '',
            attachment_url: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                assigned_by: user.id,
                assigned_to: selectedEmployee.id,
                deadline: new Date(formData.deadline).toISOString()
            };

            const res = await createTask(payload);
            if (res.success) {
                setSuccessMsg('Task assigned successfully!');
                setTimeout(() => {
                    setIsModalOpen(false);
                    loadData(); // Refresh tasks
                }, 1500);
            } else {
                setError(res.error || 'Failed to create task');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    // Filter tasks for view (optional, currently showing all history)
    const recentTasks = tasks.slice(0, 10);

    return (
        <DashboardLayout
            title="Task Assignment"
            subtitle="Click on an employee to assign a new task."
            sidebarTitle="Admin Console"
        >
            {loading ? <LoadingSpinner /> : (
                <>
                    {/* Employee Grid */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <User className="text-purple-600" /> Select Employee
                        </h3>

                        {employees.length === 0 ? (
                            <div className="card text-center text-muted py-8">
                                No employees found. Please ensure profiles are created.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {employees.map(emp => (
                                    <button
                                        key={emp.id}
                                        onClick={() => handleEmployeeClick(emp)}
                                        className="card hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center p-6 text-center border-2 border-transparent hover:border-purple-200"
                                    >
                                        <div className="text-4xl mb-3">👤</div>
                                        <h4 className="font-bold text-primary">{emp.full_name || emp.email.split('@')[0]}</h4>
                                        <span className="text-xs badge badge-purple mt-2">{emp.role}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Tasks List */}
                    <div className="card">
                        <div className="section-header">
                            <h3>Recent Assignments</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-light text-secondary font-bold border-b border-light">
                                    <tr>
                                        <th className="p-3">Task</th>
                                        <th className="p-3">Assigned To</th>
                                        <th className="p-3">Priority</th>
                                        <th className="p-3">Deadline</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTasks.map(task => {
                                        // Find employee name if possible
                                        const assignee = employees.find(e => e.id === task.assigned_to);
                                        const assigneeName = assignee ? (assignee.full_name || assignee.email) : task.assigned_to.substring(0, 8);

                                        return (
                                            <tr key={task.id} className="border-b border-light">
                                                <td className="p-3 font-semibold">{task.title}</td>
                                                <td className="p-3 flex items-center gap-2">
                                                    <span>👤</span> {assigneeName}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`badge ${task.priority === 'High' ? 'badge-red' : 'badge-blue'
                                                        }`}>{task.priority}</span>
                                                </td>
                                                <td className="p-3 text-secondary">
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                </td>
                                                <td className="p-3">
                                                    <span className="badge badge-purple">{task.status}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Assignment Modal */}
            {isModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animation-fade-in relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <div className="text-4xl">👤</div>
                            <div>
                                <h2 className="text-xl font-bold text-primary">Assign Task</h2>
                                <p className="text-sm text-secondary">To: <span className="font-bold">{selectedEmployee.full_name || selectedEmployee.email}</span></p>
                            </div>
                        </div>

                        {successMsg ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-600">Task Assigned!</h3>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-secondary mb-1">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border-gray-200 focus:border-purple-500 rounded-lg"
                                        placeholder="e.g. Prepare Monthly Report"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-secondary mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border-gray-200 focus:border-purple-500 rounded-lg"
                                        rows="3"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-secondary mb-1">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full border-gray-200 focus:border-purple-500 rounded-lg"
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-secondary mb-1">Deadline</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full border-gray-200 focus:border-purple-500 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="btn btn-primary flex-1 flex justify-center items-center gap-2"
                                    >
                                        {creating ? 'Assigning...' : 'Assign Task'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminTasks;
