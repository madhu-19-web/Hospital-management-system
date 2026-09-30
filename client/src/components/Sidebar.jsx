import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  CalendarDays, 
  BedDouble, 
  Receipt,
  HeartPulse,
  Building2,
  Settings
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users, count: stats?.totalPatients },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, count: stats?.totalDoctors },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays, count: stats?.todayAppointments, badge: 'Today' },
    { id: 'beds', label: 'Ward & Beds', icon: BedDouble, alert: stats?.beds?.available === 0 },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt, count: stats?.finances?.pendingCount, alert: (stats?.finances?.pendingCount || 0) > 0 },
  ];

  const totalBeds = stats?.beds?.total || 12;
  const occupiedBeds = stats?.beds?.occupied || 0;
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Clinical Operations
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-semibold'
                      : 'hover:bg-slate-800 hover:text-white text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Bed Occupancy Status Widget */}
        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Ward Capacity</span>
            </div>
            <span className="text-xs font-bold text-teal-400">{occupancyPercent}%</span>
          </div>
          
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                occupancyPercent > 85 ? 'bg-rose-500' : occupancyPercent > 60 ? 'bg-amber-500' : 'bg-teal-400'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          <div className="mt-2.5 flex justify-between text-[11px] text-slate-400">
            <span>Occupied: <b className="text-slate-200">{occupiedBeds}</b></span>
            <span>Available: <b className="text-emerald-400">{stats?.beds?.available || 0}</b></span>
          </div>
        </div>
      </div>

      {/* Hospital Facility Tag */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 bg-slate-800/40 p-2.5 rounded-lg">
          <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Main Campus - Ward 4A</p>
            <p className="text-slate-400 text-[10px]">Server: localhost:5000</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
