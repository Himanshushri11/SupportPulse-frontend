import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../api/tickets';
import { Navbar } from '../../components/layout/Navbar';
import {
  Ticket,
  Clock,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Search,
  UserCheck,
  CheckCircle2,
  InboxIcon,
  Filter,
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

export const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('me'); // default: my tickets
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Quick Action State
  const [actionLoading, setActionLoading] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

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
      const params = { page, limit: 15, sortBy: 'updatedAt', sortOrder: 'desc' };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await ticketsApi.getTickets(params);
      if (res.success && res.data) {
        setTickets(res.data.tickets || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      // silently fail
    } finally {
      setTicketsLoading(false);
    }
  }, [page, search, statusFilter, assignedFilter]);

  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const counts = dashboardData?.counts || {};

  const handleClaimTicket = async (ticketId) => {
    setActionLoading(ticketId);
    setActionMsg(null);
    try {
      const res = await ticketsApi.assignTicket(ticketId, user._id || user.id);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Ticket claimed successfully' });
        fetchTickets();
        fetchDashboard();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to claim ticket' });
    } finally {
      setActionLoading('');
    }
  };

  const handleResolve = async (ticketId) => {
    setActionLoading(ticketId + '_resolve');
    try {
      await ticketsApi.resolveTicket(ticketId);
      setActionMsg({ type: 'success', text: 'Ticket resolved' });
      fetchTickets();
      fetchDashboard();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to resolve' });
    } finally {
      setActionLoading('');
    }
  };

  const metricCards = [
    { label: 'Assigned / Open', value: counts.assignedOpen ?? 0, color: 'text-blue-400', icon: FolderOpen, filter: 'me' },
    { label: 'In Progress', value: counts.inProgress ?? 0, color: 'text-amber-400', icon: Clock, filter: 'me', status: 'IN_PROGRESS' },
    { label: 'Pending Reply', value: counts.pending ?? 0, color: 'text-orange-400', icon: AlertCircle, filter: 'me', status: 'PENDING' },
    { label: 'Resolved', value: counts.resolved ?? 0, color: 'text-emerald-400', icon: CheckCircle, filter: 'me', status: 'RESOLVED' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">

        {/* Hero */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 bg-blue-950/50 py-1 px-3 rounded-full border border-blue-500/30 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Agent Portal · Support Specialist</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Agent Queue, {user?.fullName?.split(' ')[0] || 'Agent'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Manage your assigned tickets. All actions are enforced by backend RBAC.
              </p>
            </div>
          </div>
        </div>

        {/* Action Message */}
        {actionMsg && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${actionMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="hover:opacity-70">✕</button>
          </div>
        )}

        {/* Metric Cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.label}
                  onClick={() => { setAssignedFilter(card.filter); if (card.status) setStatusFilter(card.status); else setStatusFilter(''); setPage(1); }}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-600 transition text-left group">
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

        {/* Ticket Queue */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-blue-400" />
                <span>Ticket Queue</span>
                {total > 0 && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{total} tickets</span>}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Queue filter */}
              <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1 text-xs">
                {[
                  { label: 'My Tickets', val: 'me' },
                  { label: 'Unassigned', val: 'unassigned' },
                  { label: 'All', val: '' },
                ].map((f) => (
                  <button key={f.val} onClick={() => { setAssignedFilter(f.val); setPage(1); }}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${assignedFilter === f.val ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input type="text" placeholder="Search..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 transition" />
              </div>

              <button onClick={() => { fetchTickets(); fetchDashboard(); }} className="text-slate-400 hover:text-white p-2 rounded-lg border border-slate-800 transition">
                <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {ticketsLoading ? (
            <div className="p-10 flex items-center justify-center text-xs text-slate-400 space-x-3">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Loading ticket queue...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <InboxIcon className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500">No tickets in this queue.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {tickets.map((t) => {
                const isMyTicket = t.assignedTo?._id === (user._id || user.id);
                const isUnassigned = !t.assignedTo;
                const isClaiming = actionLoading === t._id;
                const isResolving = actionLoading === t._id + '_resolve';

                return (
                  <div key={t._id} className="p-4 hover:bg-slate-900/40 transition group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: ticket info — clickable */}
                      <div className="space-y-1.5 min-w-0 cursor-pointer flex-1" onClick={() => navigate(`/tickets/${t._id}`)}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">{t.ticketNumber}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[t.status] || ''}`}>
                            {t.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[t.priority] || ''}`}>
                            {t.priority}
                          </span>
                          {t.category?.name && (
                            <span className="text-[9px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700">{t.category.name}</span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-white group-hover:text-blue-200 transition truncate">
                          {t.title || t.subject}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                          <span>Customer: {t.requesterId?.fullName || t.requesterEmail}</span>
                          <span>·</span>
                          <span>{isUnassigned ? '⚠ Unassigned' : isMyTicket ? '✓ Assigned to me' : `Agent: ${t.assignedTo?.fullName}`}</span>
                          <span>·</span>
                          <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Right: quick actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isUnassigned && (
                          <button onClick={() => handleClaimTicket(t._id)} disabled={isClaiming}
                            className="flex items-center space-x-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition disabled:opacity-50">
                            <UserCheck className="w-3 h-3" />
                            <span>{isClaiming ? 'Claiming...' : 'Claim'}</span>
                          </button>
                        )}
                        {(isMyTicket || isUnassigned) && t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                          <button onClick={() => handleResolve(t._id)} disabled={isResolving}
                            className="flex items-center space-x-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition disabled:opacity-50">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isResolving ? 'Resolving...' : 'Resolve'}</span>
                          </button>
                        )}
                        <button onClick={() => navigate(`/tickets/${t._id}`)}
                          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition">
                          <MessageSquare className="w-3 h-3" />
                          <span>Open</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
