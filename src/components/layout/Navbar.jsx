import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Ticket,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await logout();
  };

  const roleBadges = {
    ADMIN: {
      bg: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
      label: 'System Admin',
      tag: 'ADMIN',
    },
    AGENT: {
      bg: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
      label: 'Support Agent',
      tag: 'AGENT',
    },
    CUSTOMER: {
      bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
      label: 'Customer',
      tag: 'CUSTOMER',
    },
  };

  const currentRole = roleBadges[role] || roleBadges.CUSTOMER;

  const isActive = (path) => {
    if (path === '/tickets') {
      return location.pathname === '/tickets' || (location.pathname.startsWith('/tickets/') && location.pathname !== '/tickets/new');
    }
    return location.pathname === path;
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Main Nav */}
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">SupportPulse</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Core
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive('/dashboard')
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/tickets"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive('/tickets')
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Tickets</span>
            </Link>

            <Link
              to="/tickets/new"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive('/tickets/new')
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Ticket</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: Role + User + Sign Out */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/tickets/new"
            className="md:hidden flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-2.5 rounded-lg transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </Link>

          {/* User Pill */}
          <div className="flex items-center space-x-2.5 bg-slate-800/70 border border-slate-700/60 py-1.5 px-3 rounded-full">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xs font-bold">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight max-w-[130px] truncate">
                {user?.fullName || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 max-w-[130px] truncate">{user?.email}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRole.bg}`}>
              {currentRole.tag}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/30 py-2 px-3 rounded-xl transition duration-150"
            title="Sign out of SupportPulse"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
