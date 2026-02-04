import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { createSchedule, getTeamSchedules } from '../../api';
import { useAuth } from '../../AuthContext';
import {
    Calendar,
    Clock,
    User,
    Save,
    MapPin
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ManagerSchedule = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (user) {
            loadSchedules();
        }
    }, [user]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const data = await getTeamSchedules(user.id);
            if (data.success) {
                setSchedules(data.schedules || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg('');

        try {
            const payload = {
                ...formData,
                manager_id: user.id
            };

            const res = await createSchedule(payload);
            if (res.success) {
                setSuccessMsg('Shift assigned successfully!');
                setFormData({
                    employee_id: '',
                    shift_date: '',
                    start_time: '09:00',
                    end_time: '17:00',
                    work_type: 'Office',
                    notes: ''
                });
                loadSchedules();
            } else {
                setError(res.error || 'Failed to assign shift');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
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
                            <label className="block text-sm font-bold text-secondary mb-1">Employee ID</label>
                            <input
                                type="text"
                                required
                                value={formData.employee_id}
                                onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                placeholder="UUID of Employee"
                                className="w-full font-mono text-sm"
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
                                <input
                                    type="time"
                                    required
                                    value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">End Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.end_time}
                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-secondary mb-1">Work Type</label>
                            <div className="flex gap-4">
                                {['Office', 'Remote', 'Field'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="work_type"
                                            value={type}
                                            checked={formData.work_type === type}
                                            onChange={e => setFormData({ ...formData, work_type: e.target.value })}
                                        />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-secondary mb-1">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any special instructions..."
                                rows="2"
                                className="w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary w-full flex justify-center items-center gap-2"
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Assign Shift</>}
                        </button>
                    </form>
                </div>

                {/* Team Schedule List */}
                <div className="card lg:col-span-2">
                    <div className="section-header">
                        <h3>Assigned Shifts</h3>
                        <button className="btn btn-secondary text-sm" onClick={loadSchedules}>Refresh</button>
                    </div>

                    {loading ? <LoadingSpinner /> : (
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
                                    {schedules.length === 0 ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-muted">No shifts assigned yet.</td></tr>
                                    ) : (
                                        schedules.map(sch => (
                                            <tr key={sch.id} className="border-b border-light hover:bg-light/50">
                                                <td className="p-3 font-mono text-xs text-muted">{sch.employee_id.substring(0, 8)}...</td>
                                                <td className="p-3 font-medium">{sch.shift_date}</td>
                                                <td className="p-3 text-secondary">
                                                    {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`badge ${sch.work_type === 'Remote' ? 'badge-blue' :
                                                            sch.work_type === 'Field' ? 'badge-green' : 'badge-purple'
                                                        }`}>
                                                        {sch.work_type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-muted italic">{sch.notes || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerSchedule;
