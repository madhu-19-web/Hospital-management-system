import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  PlusCircle, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  PlayCircle, 
  XCircle, 
  Trash2, 
  Filter, 
  X 
} from 'lucide-react';

export default function Appointments({ preselectedDoctorId, initialOpenNew = false, onResetInitialOpen, onRefreshStats }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [showBookModal, setShowBookModal] = useState(initialOpenNew);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: preselectedDoctorId || '',
    appointment_date: todayStr,
    appointment_time: '10:00',
    reason: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/appointments?';
      if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
      if (dateFilter) url += `date=${encodeURIComponent(dateFilter)}&`;

      const [apptRes, patRes, docRes] = await Promise.all([
        fetch(url),
        fetch('/api/patients'),
        fetch('/api/doctors')
      ]);

      const [apptData, patData, docData] = await Promise.all([
        apptRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      setAppointments(apptData);
      setPatients(patData);
      setDoctors(docData);

      if (patData.length > 0 && !formData.patient_id) {
        setFormData((prev) => ({ ...prev, patient_id: patData[0].id }));
      }
      if (docData.length > 0 && !formData.doctor_id) {
        setFormData((prev) => ({ ...prev, doctor_id: docData[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    if (initialOpenNew) {
      setShowBookModal(true);
      if (onResetInitialOpen) onResetInitialOpen();
    }
  }, [initialOpenNew]);

  useEffect(() => {
    if (preselectedDoctorId) {
      setFormData((prev) => ({ ...prev, doctor_id: preselectedDoctorId }));
      setShowBookModal(true);
    }
  }, [preselectedDoctorId]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowBookModal(false);
        setFormData({
          patient_id: patients[0]?.id || '',
          doctor_id: doctors[0]?.id || '',
          appointment_date: todayStr,
          appointment_time: '10:00',
          reason: '',
          notes: ''
        });
        fetchData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to schedule appointment:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment slot?')) {
      try {
        await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        fetchData();
        if (onRefreshStats) onRefreshStats();
      } catch (err) {
        console.error('Failed to delete appointment:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointment Management</h1>
          <p className="text-xs text-slate-500">Coordinate clinic schedules, track patient triage, and update visit stages.</p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-teal-600/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Status:</span>
          {['All', 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:border-teal-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor & Dept</th>
                <th className="px-6 py-4">Reason / Notes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-700">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xs font-extrabold text-slate-800">
                            {new Date(appt.appointment_date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-teal-600" />
                            <span>{appt.appointment_time}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">{appt.appointment_date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{appt.patient_name}</p>
                      <p className="text-xs text-slate-400">{appt.patient_phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{appt.doctor_name}</p>
                      <span className="text-xs text-teal-600 font-medium">{appt.department}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-700 font-medium truncate">{appt.reason}</p>
                      {appt.notes && <p className="text-[11px] text-slate-400 truncate italic">{appt.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          appt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'In-Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : appt.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {appt.status === 'Scheduled' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'In-Progress')}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center space-x-1 transition-colors"
                            title="Start Consultation"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Start</span>
                          </button>
                        )}
                        {appt.status === 'In-Progress' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'Completed')}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center space-x-1 transition-colors"
                            title="Complete Consultation"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'Cancelled')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAppointment(appt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Schedule Patient Visit</h3>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id.toString().padStart(4, '0')}) &bull; {p.phone || 'No phone'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor *</label>
                <select
                  required
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} &bull; {d.specialization} ({d.department}) - ${d.consultation_fee}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit / Symptoms *</label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Annual cardiovascular checkup, acute headache..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Clinical Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Prior prescription refills, lab test requirements..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
