import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Beds from './pages/Beds';
import Billing from './pages/Billing';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState(null);
  const [initialOpenNewPatient, setInitialOpenNewPatient] = useState(false);
  const [initialOpenNewAppt, setInitialOpenNewAppt] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action) => {
    if (action === 'new-patient') {
      setInitialOpenNewPatient(true);
      setCurrentTab('patients');
    } else if (action === 'new-appointment') {
      setInitialOpenNewAppt(true);
      setCurrentTab('appointments');
    }
  };

  const handleBookForDoctor = (doctorId) => {
    setPreselectedDoctorId(doctorId);
    setCurrentTab('appointments');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar */}
      <Navbar />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setPreselectedDoctorId(null);
          }}
          stats={stats}
        />

        {/* Dynamic Center Stage Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                onNavigate={setCurrentTab}
                onQuickAction={handleQuickAction}
              />
            )}

            {currentTab === 'patients' && (
              <Patients
                initialOpenNew={initialOpenNewPatient}
                onResetInitialOpen={() => setInitialOpenNewPatient(false)}
                onRefreshStats={fetchStats}
              />
            )}

            {currentTab === 'doctors' && (
              <Doctors
                onBookForDoctor={handleBookForDoctor}
                onRefreshStats={fetchStats}
              />
            )}

            {currentTab === 'appointments' && (
              <Appointments
                preselectedDoctorId={preselectedDoctorId}
                initialOpenNew={initialOpenNewAppt}
                onResetInitialOpen={() => setInitialOpenNewAppt(false)}
                onRefreshStats={fetchStats}
              />
            )}

            {currentTab === 'beds' && (
              <Beds
                onRefreshStats={fetchStats}
              />
            )}

            {currentTab === 'billing' && (
              <Billing
                onRefreshStats={fetchStats}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
