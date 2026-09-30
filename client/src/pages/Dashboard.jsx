import React from 'react';
import { 
  Users, 
  Calendar, 
  BedDouble, 
  DollarSign, 
  UserPlus, 
  CalendarPlus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  HeartPulse,
  Building
} from 'lucide-react';

export default function Dashboard({ stats, onNavigate, onQuickAction }) {
  const cards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients ?? '--',
      subtitle: 'Registered in database',
      icon: Users,
      color: 'teal',
      bgGradient: 'from-teal-500 to-emerald-600',
      tab: 'patients'
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments ?? '--',
      subtitle: 'Scheduled for today',
      icon: Calendar,
      color: 'blue',
      bgGradient: 'from-blue-500 to-indigo-600',
      tab: 'appointments'
    },
    {
      title: 'Bed Occupancy',
      value: `${stats?.beds?.occupied ?? 0} / ${stats?.beds?.total ?? 0}`,
      subtitle: `${stats?.beds?.available ?? 0} beds currently open`,
      icon: BedDouble,
      color: 'amber',
      bgGradient: 'from-amber-500 to-orange-600',
      tab: 'beds'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.finances?.totalRevenue ?? 0).toLocaleString()}`,
      subtitle: `$${(stats?.finances?.pendingAmount ?? 0).toLocaleString()} pending collection`,
      icon: DollarSign,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-teal-700',
      tab: 'billing'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4" />
            <span>Hospital Operations Command</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Metropolitan General Hospital
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Real-time telemetry, inpatient bed allocations, daily clinical schedules, and patient billing records.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onQuickAction('new-patient')}
            className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient</span>
          </button>
          <button
            onClick={() => onQuickAction('new-appointment')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all border border-white/15 active:scale-95"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => onNavigate('beds')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all border border-white/15 active:scale-95"
          >
            <BedDouble className="w-4 h-4" />
            <span>Admit to Bed</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-teal-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wide">{card.title}</p>
                  <p className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{card.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.bgGradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>{card.subtitle}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Today's Schedule & Ward Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-base">Today's Appointment Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.todaySchedule.map((appt) => (
                <div key={appt.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-10 rounded-lg bg-teal-50 border border-teal-100 flex flex-col items-center justify-center text-teal-700 font-bold text-xs">
                      <Clock className="w-3 h-3 text-teal-500" />
                      <span>{appt.appointment_time}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{appt.patient_name}</p>
                      <p className="text-xs text-slate-500">
                        {appt.reason} &bull; <span className="font-medium text-slate-700">{appt.doctor_name}</span> ({appt.department})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No appointments scheduled for today.</p>
            </div>
          )}
        </div>

        {/* Clinical Departments & Capacity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-base">Active Departments</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">{stats?.departments?.length || 0} Specialties</span>
            </div>

            <div className="space-y-3">
              {stats?.departments?.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-teal-50/50 transition-colors border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center font-bold text-xs">
                      {dept.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{dept.name}</p>
                      <p className="text-[11px] text-slate-500">{dept.doctor_count} Doctor{dept.doctor_count === 1 ? '' : 's'} assigned</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="mt-5 p-3.5 bg-teal-50 rounded-xl border border-teal-200/70 flex items-start space-x-2.5">
            <HeartPulse className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800">
              Bed triage priority is enabled for Emergency & ICU wards. Ensure records are synced upon intake.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
