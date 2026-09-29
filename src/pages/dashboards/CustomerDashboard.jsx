import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../api/tickets';
import { Navbar } from '../../components/layout/Navbar';
import {
  Ticket,
  Clock,
  ChevronRight,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  CheckCircle,
  XCircle,
  Search,
  InboxIcon,
  MessageSquare,
} from 'lucide-react';

const STATUS_STYLES = {
  OPEN: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
  IN_PROGRESS: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
  PENDING: 'bg-orange-950/70 border-orange-500/40 text-orange-300',
  RESOLVED: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
  CLOSED: 'bg-slate-800 border-slate-700 text-slate-400',
  REOPENED: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
};

const PRIORITY_STYLES = {
  LOW: 'text-slate-400 border-slate-700',
  MEDIUM: 'text-sky-400 border-sky-500/40',
  HIGH: 'text-amber-400 border-amber-500/40',
  URGENT: 'text-rose-400 border-rose-500/40 font-bold',
};

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await ticketsApi.getDashboardSummary();
      if (res.success && res.data) setDashboardData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const params = { page, limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await ticketsApi.getTickets(params);
      if (res.success && res.data) {
        setTickets(res.data.tickets || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      // silently fail on ticket list errors
    } finally {
      setTicketsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const counts = dashboardData?.counts || {};

  const metricCards = [
    { label: 'My Open', value: counts.myOpen ?? counts.open ?? 0, color: 'text-blue-400', icon: FolderOpen, filter: 'OPEN' },
    { label: 'Pending', value: counts.myPending ?? counts.pending ?? 0, color: 'text-amber-400', icon: Clock, filter: 'PENDING' },
    { label: 'Resolved', value: counts.myResolved ?? counts.resolved ?? 0, color: 'text-emerald-400', icon: CheckCircle, filter: 'RESOLVED' },
    { label: 'Closed', value: counts.myClosed ?? counts.closed ?? 0, color: 'text-slate-400', icon: XCircle, filter: 'CLOSED' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">

        {/* Verification Banners */}
        {(!user?.isEmailVerified || !user?.isPhoneVerified) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!user?.isEmailVerified && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Email Verification Required</h4>
                    <p className="text-[11px] text-slate-300">Confirm your email to receive ticket updates.</p>
                  </div>
                </div>
                <Link to="/verify-email" state={{ email: user?.email }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg transition">
                  Verify Now
                </Link>
              </div>
            )}
            {!user?.isPhoneVerified && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Phone Verification Pending</h4>
                    <p className="text-[11px] text-slate-300">Verify your phone for SMS alerts.</p>
                  </div>
                </div>
                <Link to="/verify-phone" state={{ phone: user?.phone }}
                  className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold rounded-lg transition">
                  Verify SMS
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Hero */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/50 py-1 px-3 rounded-full border border-emerald-500/30 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Customer Portal · Verified Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {user?.fullName?.split(' ')[0] || 'Customer'}!
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Track and manage all your support tickets in one place.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/tickets/new"
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5">
                <PlusCircle className="w-4 h-4" />
                <span>New Ticket</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.label} onClick={() => { setStatusFilter(card.filter); setPage(1); }}
                  className={`glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-600 transition text-left group ${statusFilter === card.filter ? 'border-slate-600 ring-1 ring-slate-600' : ''}`}>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{card.label}</span>
                    <Icon className={`w-4 h-4 ${card.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className={`text-3xl font-black mt-2 ${card.color}`}>{card.value}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* My Tickets */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>My Tickets</span>
                {total > 0 && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{total} total</span>}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any ticket to view conversation &amp; history</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input type="text" placeholder="Search..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-40 transition" />
              </div>
              {/* Status filter */}
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
              {(statusFilter || search) && (
                <button onClick={() => { setStatusFilter(''); setSearch(''); setPage(1); }}
                  className="text-xs text-slate-400 hover:text-white px-2 py-2 rounded-lg border border-slate-800 hover:border-slate-600 transition">
                  Clear
                </button>
              )}
              <button onClick={fetchTickets} className="text-slate-400 hover:text-white p-2 rounded-lg border border-slate-800 transition">
                <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {ticketsLoading ? (
            <div className="p-10 flex items-center justify-center text-xs text-slate-400 space-x-3">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading your tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <InboxIcon className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500">No tickets found. {!statusFilter && !search && 'Submit your first ticket!'}</p>
              {!statusFilter && !search && (
                <Link to="/tickets/new" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {tickets.map((t) => (
                <div key={t._id} onClick={() => navigate(`/tickets/${t._id}`)}
                  className="p-4 hover:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition group">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{t.ticketNumber}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[t.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[t.priority] || 'text-slate-400 border-slate-700'}`}>
                        {t.priority}
                      </span>
                      {t.category?.name && (
                        <span className="text-[9px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700">{t.category.name}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white group-hover:text-emerald-200 transition truncate">
                      {t.title || t.subject}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t.assignedTo ? `Agent: ${t.assignedTo.fullName}` : 'Unassigned'} · {new Date(t.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Previous
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
