import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  UserPlus, 
  Calendar, 
  DollarSign, 
  Clock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  X,
  Filter
} from 'lucide-react';

export default function Doctors({ onBookForDoctor, onRefreshStats }) {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    department: 'General Medicine',
    email: '',
    phone: '',
    consultation_fee: 100,
    available_days: 'Mon - Fri',
    available_time: '09:00 - 16:00'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const deptUrl = selectedDept !== 'All' ? `/api/doctors?department=${encodeURIComponent(selectedDept)}` : '/api/doctors';
      const [docRes, deptRes] = await Promise.all([
        fetch(deptUrl),
        fetch('/api/doctors/departments')
      ]);
      const [docData, deptData] = await Promise.all([docRes.json(), deptRes.json()]);
      setDoctors(docData);
      setDepartments(deptData);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          specialization: '',
          department: 'General Medicine',
          email: '',
          phone: '',
          consultation_fee: 100,
          available_days: 'Mon - Fri',
          available_time: '09:00 - 16:00'
        });
        fetchData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Error adding doctor:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Staff & Physicians</h1>
          <p className="text-xs text-slate-500">View specialist rosters, clinical schedules, and consultation fees.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-teal-600/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Medical Staff</span>
        </button>
      </div>

      {/* Department Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedDept('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedDept === 'All'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Specialties ({doctors.length})
        </button>
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDept(d.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedDept === d.name
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading doctor profiles...</div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No doctors found in this department.</div>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:border-teal-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{doc.name}</h3>
                      <p className="text-xs text-teal-600 font-semibold">{doc.specialization}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {doc.department}
                      </span>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active Staff" />
                </div>

                {/* Schedule & Rate */}
                <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Days</span>
                    </span>
                    <span className="font-semibold text-slate-700">{doc.available_days}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hours</span>
                    </span>
                    <span className="font-semibold text-slate-700">{doc.available_time}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Fee</span>
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">${doc.consultation_fee}</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                  {doc.email && (
                    <p className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.email}</span>
                    </p>
                  )}
                  {doc.phone && (
                    <p className="flex items-center space-x-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{doc.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => onBookForDoctor(doc.id)}
                  className="w-full text-center py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors active:scale-95"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Add Medical Physician</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Alexander Hamilton"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Cardiologist"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Days</label>
                  <input
                    type="text"
                    value={formData.available_days}
                    onChange={(e) => setFormData({ ...formData, available_days: e.target.value })}
                    placeholder="Mon, Wed, Fri"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Hours</label>
                <input
                  type="text"
                  value={formData.available_time}
                  onChange={(e) => setFormData({ ...formData, available_time: e.target.value })}
                  placeholder="09:00 - 16:00"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@hospital.org"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
