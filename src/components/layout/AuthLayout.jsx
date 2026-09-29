import React from 'react';
import { Mail, ShieldCheck, Cpu, GitBranch } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Brand & Value Proposition Column (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between py-6 space-y-8">
          <div>
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">SupportPulse</span>
                <span className="block text-xs font-medium text-sky-400 tracking-wider uppercase">Enterprise Edition</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Modern Customer Support with Seamless Two-Way Email.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              A high-availability ticketing infrastructure that eliminates lost messages, synchronizes customer email replies with thread precision, and enforces strict state transitions.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Cryptographic Thread Routing</h4>
                  <p className="text-xs text-slate-400">Deterministic Reply-To HMAC mapping that prevents spoofing and subject drift.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Centralized Finite State Machine</h4>
                  <p className="text-xs text-slate-400">Rigid lifecycle rules preventing invalid transitions and keeping agents aligned.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Zero-Trust RBAC & Dual OTP</h4>
                  <p className="text-xs text-slate-400">Strict isolation for Customers, Agents, and Admins with short-lived JWT rotation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
            SupportPulse &copy; {new Date().getFullYear()} — Enterprise Production System
          </div>
        </div>

        {/* Interactive Form Card Column */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-800/80 max-w-lg mx-auto w-full">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center space-x-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">SupportPulse</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
