import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  UserCheck, 
  LogOut, 
  Wrench, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  X, 
  UserPlus,
  Clock,
  Building
} from 'lucide-react';

export default function Beds({ onRefreshStats }) {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [wardFilter, setWardFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [admitPatientId, setAdmitPatientId] = useState('');

  const fetchBedsAndPatients = async () => {
    try {
      setLoading(true);
      let url = '/api/beds?';
      if (wardFilter !== 'All') url += `ward=${encodeURIComponent(wardFilter)}&`;
      if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;

      const [bedRes, patRes] = await Promise.all([
        fetch(url),
        fetch('/api/patients')
      ]);

      const [bedData, patData] = await Promise.all([bedRes.json(), patRes.json()]);
      setBeds(bedData);
      setPatients(patData);

      if (patData.length > 0 && !admitPatientId) {
        setAdmitPatientId(patData[0].id);
      }
    } catch (err) {
      console.error('Failed to load beds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedsAndPatients();
  }, [wardFilter, statusFilter]);

  const handleOpenAdmit = (bed) => {
    setSelectedBed(bed);
    setShowAdmitModal(true);
  };

  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    if (!selectedBed || !admitPatientId) return;

    try {
      const res = await fetch('/api/beds/admit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bed_id: selectedBed.id,
          patient_id: admitPatientId
        })
      });

      if (res.ok) {
        setShowAdmitModal(false);
        setSelectedBed(null);
        fetchBedsAndPatients();
        if (onRefreshStats) onRefreshStats();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to admit patient');
      }
    } catch (err) {
      console.error('Error admitting patient:', err);
    }
  };

  const handleDischarge = async (bedId, bedNum, patientName) => {
    if (window.confirm(`Confirm discharge of patient ${patientName || ''} from Bed ${bedNum}? This will free the bed.`)) {
      try {
        await fetch(`/api/beds/discharge/${bedId}`, { method: 'POST' });
        fetchBedsAndPatients();
        if (onRefreshStats) onRefreshStats();
      } catch (err) {
        console.error('Error discharging patient:', err);
      }
    }
  };

  const handleToggleStatus = async (bedId, targetStatus) => {
    try {
      await fetch(`/api/beds/${bedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      fetchBedsAndPatients();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Patients not currently occupying any bed
  const admittedPatientIds = new Set(beds.filter(b => b.patient_id).map(b => b.patient_id));
  const availablePatients = patients.filter(p => !admittedPatientIds.has(p.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inpatient Ward & Bed Allocations</h1>
          <p className="text-xs text-slate-500">Monitor ward occupancy, admit emergency intakes, and manage bed sanitization.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            Available: {beds.filter(b => b.status === 'Available').length}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            Occupied: {beds.filter(b => b.status === 'Occupied').length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Ward Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Ward:</span>
          {['All', 'General Ward', 'ICU', 'Semi-Private', 'Emergency'].map((ward) => (
            <button
              key={ward}
              onClick={() => setWardFilter(ward)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                wardFilter === ward
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ward}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Status:</span>
          {['All', 'Available', 'Occupied', 'Maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading bed allocations...</div>
        ) : beds.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No beds match the selected filters.</div>
        ) : (
          beds.map((bed) => {
            const isOccupied = bed.status === 'Occupied';
            const isMaintenance = bed.status === 'Maintenance';
            const isAvailable = bed.status === 'Available';

            return (
              <div
                key={bed.id}
                className={`bg-white rounded-2xl border p-4.5 shadow-sm transition-all flex flex-col justify-between ${
                  isOccupied
                    ? 'border-rose-200 hover:border-rose-300'
                    : isMaintenance
                    ? 'border-slate-200 opacity-80'
                    : 'border-emerald-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <BedDouble className={`w-4 h-4 ${isOccupied ? 'text-rose-600' : isAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="font-extrabold text-slate-800 text-base">{bed.bed_number}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{bed.ward}</span>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isOccupied
                          ? 'bg-rose-100 text-rose-700'
                          : isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  {/* Patient Info or Available Tag */}
                  <div className="mt-4 pt-3 border-t border-slate-100 min-h-[75px]">
                    {isOccupied ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span className="truncate">{bed.patient_name}</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {bed.patient_gender} &bull; {bed.patient_age} yrs &bull; {bed.patient_blood}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Admitted: {bed.admitted_at}</span>
                        </p>
                      </div>
                    ) : isMaintenance ? (
                      <div className="flex items-center space-x-2 text-slate-500 py-3">
                        <Wrench className="w-4 h-4 text-slate-400" />
                        <span className="text-xs">Undergoing sanitization & inspection</span>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center py-2 text-slate-400">
                        <p className="text-xs font-medium text-emerald-700 flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Sanitized & Ready</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">${bed.daily_rate} / day standard rate</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isAvailable && (
                    <>
                      <button
                        onClick={() => handleOpenAdmit(bed)}
                        className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Admit Patient
                      </button>
                      <button
                        onClick={() => handleToggleStatus(bed.id, 'Maintenance')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Mark Maintenance"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isOccupied && (
                    <button
                      onClick={() => handleDischarge(bed.id, bed.bed_number, bed.patient_name)}
                      className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Discharge Patient</span>
                    </button>
                  )}

                  {isMaintenance && (
                    <button
                      onClick={() => handleToggleStatus(bed.id, 'Available')}
                      className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Mark as Available
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admit Patient Modal */}
      {showAdmitModal && selectedBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Admit to Bed {selectedBed.bed_number}</h3>
                  <p className="text-xs text-slate-400">{selectedBed.ward} &bull; ${selectedBed.daily_rate}/day</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAdmitModal(false); setSelectedBed(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmitPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient for Inpatient Stay *</label>
                {availablePatients.length > 0 ? (
                  <select
                    required
                    value={admitPatientId}
                    onChange={(e) => setAdmitPatientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    {availablePatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (#{p.id.toString().padStart(4, '0')}) - {p.gender}, {p.blood_group}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    All currently registered patients are either already admitted or none are registered yet. Please register a patient first.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAdmitModal(false); setSelectedBed(null); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availablePatients.length === 0}
                  className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
