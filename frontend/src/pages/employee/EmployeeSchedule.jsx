import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getUserSchedules } from '../../api';
import { socketService } from '../../socket';
import { useAuth } from '../../AuthContext';
import {
    Calendar,
    Clock,
    MapPin,
    Sun
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EmployeeSchedule = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadSchedules();

            // Re-use connection if already established or create new
            socketService.connect(user.id);
            const unsubscribe = socketService.subscribe((data) => {
                if (data.type === 'schedule_created') {
                    setSchedules(prev => [data.schedule, ...prev]);
                    alert(`New Shift Assigned: ${data.schedule.shift_date}`);
                }
            });

            return () => {
                unsubscribe();
                // socketService.disconnect(); // Don't disconnect if shared, but for now simple 
            };
        }
    }, [user]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const data = await getUserSchedules(user.id);
            if (data.success) {
                // Sort by date descending
                const sorted = (data.schedules || []).sort((a, b) =>
                    new Date(b.shift_date) - new Date(a.shift_date)
                );
                setSchedules(sorted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="My Schedule"
            subtitle="View your upcoming shifts and work locations."
            sidebarTitle="Employee Portal"
        >
            {loading ? <LoadingSpinner /> : (
                <div className="space-y-4">
                    {schedules.length === 0 ? (
                        <div className="card text-center py-10 text-muted">
                            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No shifts assigned yet.</p>
                        </div>
                    ) : (
                        schedules.map(sch => (
                            <div key={sch.id} className="card flex flex-col md:flex-row justify-between items-center gap-4 hover:border-l-4 hover:border-l-purple-500 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600 font-bold text-center min-w-[80px]">
                                        <span className="block text-sm uppercase">{new Date(sch.shift_date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="block text-2xl">{new Date(sch.shift_date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-primary mb-1">
                                            {new Date(sch.shift_date).toLocaleDateString(undefined, { weekday: 'long' })} Shift
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm text-secondary">
                                            <span className="flex items-center gap-1">
                                                <Clock size={16} /> {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={16} /> {sch.work_type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {sch.notes && (
                                    <div className="bg-light p-3 rounded-lg text-sm text-secondary max-w-sm italic">
                                        "{sch.notes}"
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default EmployeeSchedule;
