import React, { useState, useEffect } from 'react';
import { Activity, Bell, PhoneCall, ShieldCheck, Clock } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Left: Brand Logo & Facility */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Care<span className="text-teal-600">Pulse</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                HMS v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Metropolitan Health & Medical Center</p>
          </div>
        </div>

        {/* Middle: Live Clock & Date */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-800">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Right: Emergency Line & User Profile */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100 text-xs font-semibold">
            <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Emergency: 911 / ext 2400</span>
          </div>

          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 font-bold text-xs">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Admin Portal</p>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
