import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../AuthContext';
import {
    Calendar,
    Clock,
    Save,
    MapPin
} from 'lucide-react';

// ── Hardcoded schedules ─────────────────────────────────────
const HARDCODED_SCHEDULES = [
    { id: 's1', employee_id: 'emp_001', employee_name: 'Sarah Johnson', shift_date: '2026-05-05', start_time: '09:00', end_time: '17:00', work_type: 'Office', notes: 'Sprint planning day' },
    { id: 's2', employee_id: 'emp_002', employee_name: 'Mike Chen', shift_date: '2026-05-05', start_time: '10:00', end_time: '18:00', work_type: 'Remote', notes: 'Working from home' },
    { id: 's3', employee_id: 'emp_003', employee_name: 'Emily Davis', shift_date: '2026-05-06', start_time: '08:00', end_time: '16:00', work_type: 'Field', notes: 'Client site visit' },
    { id: 's4', employee_id: 'emp_004', employee_name: 'Alex Kumar', shift_date: '2026-05-06', start_time: '09:00', end_time: '17:00', work_type: 'Office', notes: '' },
    { id: 's5', employee_id: 'emp_005', employee_name: 'Rachel Park', shift_date: '2026-05-07', start_time: '11:00', end_time: '19:00', work_type: 'Remote', notes: 'Late shift' },
];

const ManagerSchedule = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState(HARDCODED_SCHEDULES);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        employee_id: '',
        shift_date: '',
        start_time: '09:00',
        end_time: '17:00',
        work_type: 'Office',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg('');

        // Simulate save
        setTimeout(() => {
            const newSchedule = {
                id: 's' + (schedules.length + 1),
                ...formData,
                employee_name: 'New Employee',
            };
            setSchedules(prev => [newSchedule, ...prev]);
            setSuccessMsg('Shift assigned successfully!');
            setFormData({ employee_id: '', shift_date: '', start_time: '09:00', end_time: '17:00', work_type: 'Office', notes: '' });
            setSaving(false);
        }, 500);
    };

    return (
        <DashboardLayout
            title="Team Schedule"
            subtitle="Manage shifts and work locations for your team."
            sidebarTitle="Manager Portal"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assign Shift Form */}
                <div className="card lg:col-span-1">
                    <div className="section-header">
                        <h3>Assign Shift</h3>
                    </div>

                    {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
                    {successMsg && <div className="text-green-500 mb-4 text-sm">{successMsg}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-secondary mb-1">Employee Name</label>
                            <input
                                type="text"
                                required
                                value={formData.employee_id}
                                onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                placeholder="e.g. Sarah Johnson"
                                className="w-full text-sm"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-secondary mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.shift_date}
                                onChange={e => setFormData({ ...formData, shift_date: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Start Time</label>
                                <input type="time" required value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">End Time</label>
                                <input type="time" required value={formData.end_time}
                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-secondary mb-1">Work Type</label>
                            <div className="flex gap-4">
                                {['Office', 'Remote', 'Field'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="work_type" value={type}
                                            checked={formData.work_type === type}
                                            onChange={e => setFormData({ ...formData, work_type: e.target.value })} />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-secondary mb-1">Notes</label>
                            <textarea value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any special instructions..." rows="2" className="w-full" />
                        </div>

                        <button type="submit" disabled={saving}
                            className="btn btn-primary w-full flex justify-center items-center gap-2">
                            {saving ? 'Saving...' : <><Save size={18} /> Assign Shift</>}
                        </button>
                    </form>
                </div>

                {/* Team Schedule List */}
                <div className="card lg:col-span-2">
                    <div className="section-header">
                        <h3>Assigned Shifts</h3>
                        <span className="badge badge-purple">{schedules.length} Total</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-light text-secondary font-bold border-b border-light">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Time</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map(sch => (
                                    <tr key={sch.id} className="border-b border-light hover:bg-slate-50">
                                        <td className="p-3 font-medium">{sch.employee_name || sch.employee_id}</td>
                                        <td className="p-3">{sch.shift_date}</td>
                                        <td className="p-3 text-secondary">{sch.start_time} - {sch.end_time}</td>
                                        <td className="p-3">
                                            <span className={`badge ${sch.work_type === 'Remote' ? 'badge-blue' :
                                                    sch.work_type === 'Field' ? 'badge-green' : 'badge-purple'}`}>
                                                {sch.work_type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-muted italic">{sch.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerSchedule;
