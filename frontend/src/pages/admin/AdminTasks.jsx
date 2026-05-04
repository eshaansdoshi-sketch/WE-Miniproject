import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../AuthContext';
import {
    Briefcase, Plus, User, X, CheckCircle, Clock
} from 'lucide-react';

// ── Hardcoded employees ──────────────────────────────────────
const HARDCODED_EMPLOYEES = [
    { id: 'emp_001', name: 'Gauri Barve', email: 'gauri@hirrd.dev', role: 'applicant', department: 'Engineering' },
    { id: 'emp_002', name: 'Prisha Kulkarni', email: 'prisha@hirrd.dev', role: 'applicant', department: 'Engineering' },
    { id: 'emp_003', name: 'Eshaan Doshi', email: 'eshaan@hirrd.dev', role: 'applicant', department: 'Design' },
    { id: 'emp_004', name: 'Rhushiesh', email: 'rush@hirrd.dev', role: 'applicant', department: 'Data' },
    { id: 'emp_005', name: 'player1', email: 'p1@hirrd.dev', role: 'applicant', department: 'Product' },
    { id: 'emp_006', name: 'player2', email: 'p2@hirrd.dev', role: 'applicant', department: 'Engineering' },
    { id: 'emp_007', name: 'Priya Sharma', email: 'priya@hirrd.dev', role: 'applicant', department: 'QA' },
    { id: 'emp_008', name: 'James Wilson', email: 'james@hirrd.dev', role: 'applicant', department: 'DevOps' },
];

// ── Hardcoded tasks ──────────────────────────────────────────
const HARDCODED_TASKS = [
    { id: 't1', title: 'Prepare Q2 Sprint Plan', assigned_to: 'emp_001', priority: 'High', deadline: '2026-05-10T17:00:00', status: 'pending' },
    { id: 't2', title: 'Design Review — Candidate Portal v2', assigned_to: 'emp_003', priority: 'Medium', deadline: '2026-05-12T12:00:00', status: 'in_progress' },
    { id: 't3', title: 'Database Migration Script', assigned_to: 'emp_002', priority: 'High', deadline: '2026-05-08T09:00:00', status: 'done' },
    { id: 't4', title: 'Write unit tests for auth module', assigned_to: 'emp_006', priority: 'Medium', deadline: '2026-05-15T17:00:00', status: 'pending' },
    { id: 't5', title: 'Analytics Dashboard Wireframe', assigned_to: 'emp_005', priority: 'Low', deadline: '2026-05-20T17:00:00', status: 'pending' },
];

const AdminTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState(HARDCODED_TASKS);

    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [creating, setCreating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', priority: 'Medium', deadline: ''
    });

    const handleEmployeeClick = (emp) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
        setError(null);
        setSuccessMsg('');
        setFormData({ title: '', description: '', priority: 'Medium', deadline: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCreating(true);
        setTimeout(() => {
            const newTask = {
                id: 't' + (tasks.length + 1),
                title: formData.title,
                assigned_to: selectedEmployee.id,
                priority: formData.priority,
                deadline: formData.deadline,
                status: 'pending',
            };
            setTasks(prev => [newTask, ...prev]);
            setSuccessMsg('Task assigned successfully!');
            setCreating(false);
            setTimeout(() => setIsModalOpen(false), 1200);
        }, 600);
    };

    const getEmployeeName = (id) => HARDCODED_EMPLOYEES.find(e => e.id === id)?.name || id;

    return (
        <DashboardLayout title="Task Assignment" subtitle="Click on an employee to assign a new task." sidebarTitle="Admin Console">
            {/* Employee Grid */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="text-purple-600" /> Select Employee
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {HARDCODED_EMPLOYEES.map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => handleEmployeeClick(emp)}
                            className="card hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center p-6 text-center border-2 border-transparent hover:border-purple-200"
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px'
                            }}>
                                {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h4 className="font-bold text-primary">{emp.name}</h4>
                            <span className="text-xs text-secondary">{emp.department}</span>
                            <span className="text-xs badge badge-purple mt-2">{emp.role}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Tasks List */}
            <div className="card">
                <div className="section-header">
                    <h3>Recent Assignments</h3>
                    <span className="badge badge-blue">{tasks.length} Tasks</span>
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
                            {tasks.map(task => (
                                <tr key={task.id} className="border-b border-light">
                                    <td className="p-3 font-semibold">{task.title}</td>
                                    <td className="p-3 flex items-center gap-2">
                                        <span>👤</span> {getEmployeeName(task.assigned_to)}
                                    </td>
                                    <td className="p-3">
                                        <span className={`badge ${task.priority === 'High' ? 'badge-orange' : task.priority === 'Low' ? 'badge-green' : 'badge-blue'}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="p-3 text-secondary">
                                        {new Date(task.deadline).toLocaleDateString()}
                                    </td>
                                    <td className="p-3">
                                        <span className={`badge ${task.status === 'done' ? 'badge-green' : task.status === 'in_progress' ? 'badge-blue' : 'badge-purple'}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {isModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                                {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-primary">Assign Task</h2>
                                <p className="text-sm text-secondary">To: <span className="font-bold">{selectedEmployee.name}</span></p>
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
                                    <input type="text" required value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full" placeholder="e.g. Prepare Monthly Report" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-secondary mb-1">Description</label>
                                    <textarea value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full" rows="3" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-secondary mb-1">Priority</label>
                                        <select value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full">
                                            <option>Low</option><option>Medium</option><option>High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-secondary mb-1">Deadline</label>
                                        <input type="datetime-local" required value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full" />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                                    <button type="submit" disabled={creating} className="btn btn-primary flex-1 flex justify-center items-center gap-2">
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
