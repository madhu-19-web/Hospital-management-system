import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Eye, 
  Trash2, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Heart, 
  X,
  PlusCircle,
  Building,
  BedDouble,
  CheckCircle
} from 'lucide-react';

export default function Patients({ initialOpenNew = false, onResetInitialOpen, onRefreshStats }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(initialOpenNew);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // New patient form state
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    allergies: '',
    medical_history: ''
  });

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/api/patients?search=${encodeURIComponent(query)}` : '/api/patients';
      const res = await fetch(url);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(search);
  }, [search]);

  useEffect(() => {
    if (initialOpenNew) {
      setShowNewModal(true);
      if (onResetInitialOpen) onResetInitialOpen();
    }
  }, [initialOpenNew]);

  const viewPatientDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setSelectedPatient(id);
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      setPatientDetails(data);
    } catch (err) {
      console.error('Failed to load patient details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowNewModal(false);
        setFormData({
          name: '',
          dob: '',
          age: '',
          gender: 'Male',
          blood_group: 'O+',
          phone: '',
          email: '',
          address: '',
          emergency_contact: '',
          allergies: '',
          medical_history: ''
        });
        fetchPatients(search);
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to create patient:', err);
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove patient records for ${name}?`)) {
      try {
        await fetch(`/api/patients/${id}`, { method: 'DELETE' });
        fetchPatients(search);
        if (onRefreshStats) onRefreshStats();
      } catch (err) {
        console.error('Failed to delete patient:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Directory</h1>
          <p className="text-xs text-slate-500">Manage electronic health records, admission histories, and diagnostics.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-teal-600/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, phone number, email, or blood group..."
          className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Patient Profile</th>
                <th className="px-6 py-4">Age / Gender</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Allergies</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No matching patients found. Click "Register New Patient" to add one.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">ID: #{p.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.age ? `${p.age} yrs` : 'N/A'} &bull; <span className="font-medium text-slate-700">{p.gender}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-xs">
                        {p.blood_group || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-700 font-medium">{p.phone || 'No phone'}</p>
                      <p className="text-[11px] text-slate-400">{p.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {p.allergies && p.allergies !== 'None' ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-medium">
                          {p.allergies}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => viewPatientDetails(p.id)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete Patient"
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

      {/* New Patient Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Register New Patient</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 35"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="e.g. Jane Doe (Spouse) - 555-0199"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, city, state, zip"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Latex, Peanuts (or None)"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medical Notes / History</label>
                <textarea
                  rows="3"
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  placeholder="Prior diagnoses, existing medications, chronic conditions..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  {patientDetails?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{patientDetails?.name}</h3>
                  <p className="text-xs text-slate-500">Record ID: #{patientDetails?.id?.toString().padStart(4, '0')}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedPatient(null); setPatientDetails(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading || !patientDetails ? (
              <div className="py-12 text-center text-slate-400">Loading comprehensive records...</div>
            ) : (
              <div className="space-y-6 text-sm">
                {/* Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Age / Gender</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{patientDetails.age} yrs &bull; {patientDetails.gender}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Blood Group</span>
                    <p className="font-semibold text-rose-600 mt-0.5">{patientDetails.blood_group}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Contact</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{patientDetails.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Bed Status</span>
                    <p className="font-semibold mt-0.5">
                      {patientDetails.bed ? (
                        <span className="text-amber-600 font-bold">{patientDetails.bed.bed_number} ({patientDetails.bed.ward})</span>
                      ) : (
                        <span className="text-slate-400">Not Admitted</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Medical History & Allergies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
                    <span className="text-xs font-bold text-rose-700 flex items-center space-x-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Allergies & Contraindications</span>
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      {patientDetails.allergies || 'No documented allergies'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100">
                    <span className="text-xs font-bold text-teal-700 flex items-center space-x-1 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Medical History</span>
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      {patientDetails.medical_history || 'No prior medical history on file'}
                    </p>
                  </div>
                </div>

                {/* Appointment Timeline */}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>Appointment History ({patientDetails.appointments?.length || 0})</span>
                  </h4>
                  {patientDetails.appointments?.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {patientDetails.appointments.map((a) => (
                        <div key={a.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{a.reason}</p>
                            <p className="text-[11px] text-slate-500">
                              {a.appointment_date} at {a.appointment_time} with {a.doctor_name} ({a.department})
                            </p>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No appointment history found.</p>
                  )}
                </div>

                {/* Billing Summary */}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>Invoices & Statements ({patientDetails.bills?.length || 0})</span>
                  </h4>
                  {patientDetails.bills?.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {patientDetails.bills.map((b) => (
                        <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">Invoice #{b.id} &bull; {b.bill_date}</p>
                            <p className="text-[11px] text-slate-500">
                              Total: ${b.total_amount} {b.payment_method ? `(${b.payment_method})` : ''}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              b.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No invoices issued for this patient.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
