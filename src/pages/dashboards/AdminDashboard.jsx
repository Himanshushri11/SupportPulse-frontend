import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../api/tickets';
import { Navbar } from '../../components/layout/Navbar';
import { io } from 'socket.io-client';
import {
  Ticket,
  Clock,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  UserCheck,
  CheckCircle2,
  InboxIcon,
  MessageSquare,
  Shield,
  Users,
  BarChart3,
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

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Quick Action
  const [actionLoading, setActionLoading] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  // Inline assign
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [assignTarget, setAssignTarget] = useState('');

  // Socket.IO instance ref — persists across re-renders without reconnecting
  const socketRef = useRef(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await ticketsApi.getDashboardSummary();
      if (res.success && res.data) setDashboardData(res.data);
    } catch (e) { }
    finally { setIsLoading(false); }
  };

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const params = { page, limit: 15, sortBy: 'updatedAt', sortOrder: 'desc' };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await ticketsApi.getTickets(params);
      if (res.success && res.data) {
        setTickets(res.data.tickets || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (e) { }
    finally { setTicketsLoading(false); }
  }, [page, search, statusFilter, priorityFilter, categoryFilter, assignedFilter]);

  // Load metadata once
  useEffect(() => {
    fetchDashboard();
    ticketsApi.getAgents().then((r) => { if (r.success) setAgents(r.data?.agents || []); }).catch(() => { });
    ticketsApi.getCategories().then((r) => { if (r.success) setCategories(r.data?.categories || []); }).catch(() => { });
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // NEW: Real-time new-ticket notifications via Socket.IO
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.emit('join-admin-room');

    socket.on('new-ticket', (newTicket) => {
      setActionMsg({
        type: 'success',
        text: `New ticket received: ${newTicket.ticketNumber} — ${newTicket.title || ''}`,
      });
      // Refetch so filters, sorting, and pagination stay correct
      fetchTickets();
      fetchDashboard();
    });

    socket.on('connect_error', () => {
      // Silent fail — real-time is a nice-to-have, not critical path
    });

    return () => {
      socket.off('new-ticket');
      socket.off('connect_error');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTickets]);

  const counts = dashboardData?.counts || {};

  const handleQuickResolve = async (ticketId) => {
    setActionLoading(ticketId + '_resolve');
    try {
      await ticketsApi.resolveTicket(ticketId);
      setActionMsg({ type: 'success', text: 'Ticket resolved' });
      fetchTickets(); fetchDashboard();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to resolve' });
    } finally { setActionLoading(''); }
  };

  const handleQuickClose = async (ticketId) => {
    setActionLoading(ticketId + '_close');
    try {
      await ticketsApi.closeTicket(ticketId);
      setActionMsg({ type: 'success', text: 'Ticket closed' });
      fetchTickets(); fetchDashboard();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to close' });
    } finally { setActionLoading(''); }
  };

  const handleAssign = async (ticketId) => {
    setActionLoading(ticketId + '_assign');
    try {
      await ticketsApi.assignTicket(ticketId, assignTarget || null);
      setActionMsg({ type: 'success', text: assignTarget ? 'Ticket assigned' : 'Ticket unassigned' });
      setAssigningTicket(null);
      setAssignTarget('');
      fetchTickets(); fetchDashboard();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Assignment failed' });
    } finally { setActionLoading(''); }
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setPriorityFilter('');
    setCategoryFilter(''); setAssignedFilter(''); setPage(1);
  };

  const hasFilters = search || statusFilter || priorityFilter || categoryFilter || assignedFilter;

  const metricCards = [
    { label: 'Total Tickets', value: counts.total ?? 0, color: 'text-purple-400', icon: BarChart3, onClick: clearFilters },
    { label: 'Open', value: counts.open ?? 0, color: 'text-blue-400', icon: FolderOpen, onClick: () => { setStatusFilter('OPEN'); setPage(1); } },
    { label: 'In Progress', value: counts.inProgress ?? 0, color: 'text-amber-400', icon: Clock, onClick: () => { setStatusFilter('IN_PROGRESS'); setPage(1); } },
    { label: 'Pending', value: counts.pending ?? 0, color: 'text-orange-400', icon: AlertCircle, onClick: () => { setStatusFilter('PENDING'); setPage(1); } },
    { label: 'Resolved', value: counts.resolved ?? 0, color: 'text-emerald-400', icon: CheckCircle, onClick: () => { setStatusFilter('RESOLVED'); setPage(1); } },
    { label: 'Closed', value: counts.closed ?? 0, color: 'text-slate-400', icon: XCircle, onClick: () => { setStatusFilter('CLOSED'); setPage(1); } },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">

        {/* Hero */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-400 bg-purple-950/50 py-1 px-3 rounded-full border border-purple-500/30 mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Control Panel · Full Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Manage all tickets across the system. Assign agents, update status, and audit history.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Logged in as</div>
                <div className="text-sm font-bold text-white">{user?.fullName}</div>
                <div className="text-[10px] text-purple-400 font-semibold">ADMINISTRATOR</div>
              </div>
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
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.label} onClick={card.onClick}
                  className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-600 transition text-left group">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{card.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${card.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className={`text-2xl font-black mt-1.5 ${card.color}`}>{card.value}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Full Ticket Management Panel */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">

          {/* Toolbar */}
          <div className="p-5 border-b border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-purple-400" />
                <span>All Tickets</span>
                {total > 0 && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{total} total</span>}
              </h2>
              <div className="flex items-center gap-2">
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 transition">
                    Clear Filters
                  </button>
                )}
                <button onClick={() => { fetchTickets(); fetchDashboard(); }}
                  className="text-slate-400 hover:text-white p-2 rounded-lg border border-slate-800 transition">
                  <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input type="text" placeholder="Search tickets..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-44 transition" />
              </div>

              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REOPENED">Reopened</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
                <option value="">All Priority</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {categories.length > 0 && (
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              )}

              <select value={assignedFilter} onChange={(e) => { setAssignedFilter(e.target.value); setPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
                <option value="">All Agents</option>
                <option value="unassigned">Unassigned</option>
                <option value="me">Assigned to Me</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.fullName}</option>)}
              </select>
            </div>
          </div>

          {/* Ticket List */}
          {ticketsLoading ? (
            <div className="p-10 flex items-center justify-center text-xs text-slate-400 space-x-3">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <InboxIcon className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500">No tickets match the current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {tickets.map((t) => {
                const isResolvingThis = actionLoading === t._id + '_resolve';
                const isClosingThis = actionLoading === t._id + '_close';
                const isAssigningThis = assigningTicket === t._id;
                const isSubmittingAssign = actionLoading === t._id + '_assign';

                return (
                  <div key={t._id} className="p-4 hover:bg-slate-900/40 transition group">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">

                      {/* Ticket Info */}
                      <div className="space-y-1.5 min-w-0 cursor-pointer flex-1" onClick={() => navigate(`/tickets/${t._id}`)}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-400">{t.ticketNumber}</span>
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
                        <div className="text-sm font-semibold text-white group-hover:text-purple-200 transition truncate pr-4">
                          {t.title || t.subject}
                        </div>
                        <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
                          <span>Customer: <span className="text-slate-400">{t.requesterId?.fullName || t.requesterEmail}</span></span>
                          <span>·</span>
                          <span>Agent: <span className={t.assignedTo ? 'text-slate-300' : 'text-amber-400'}>{t.assignedTo?.fullName || 'Unassigned'}</span></span>
                          <span>·</span>
                          <span>Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Admin Quick Actions */}
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">

                        {/* Assign / Reassign inline */}
                        {isAssigningThis ? (
                          <div className="flex items-center gap-1.5">
                            <select value={assignTarget} onChange={(e) => setAssignTarget(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-purple-500">
                              <option value="">Unassign</option>
                              {agents.map((a) => <option key={a._id} value={a._id}>{a.fullName}</option>)}
                            </select>
                            <button onClick={() => handleAssign(t._id)} disabled={isSubmittingAssign}
                              className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50">
                              {isSubmittingAssign ? '...' : 'Save'}
                            </button>
                            <button onClick={() => { setAssigningTicket(null); setAssignTarget(''); }}
                              className="text-slate-400 hover:text-white text-[10px] px-2 py-1.5 rounded-lg border border-slate-700 transition">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setAssigningTicket(t._id); setAssignTarget(t.assignedTo?._id || ''); }}
                            className="flex items-center space-x-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition">
                            <UserCheck className="w-3 h-3" />
                            <span>{t.assignedTo ? 'Reassign' : 'Assign'}</span>
                          </button>
                        )}

                        {/* Resolve */}
                        {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                          <button onClick={() => handleQuickResolve(t._id)} disabled={isResolvingThis}
                            className="flex items-center space-x-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition disabled:opacity-50">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isResolvingThis ? '...' : 'Resolve'}</span>
                          </button>
                        )}

                        {/* Close */}
                        {t.status !== 'CLOSED' && (
                          <button onClick={() => handleQuickClose(t._id)} disabled={isClosingThis}
                            className="flex items-center space-x-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition disabled:opacity-50">
                            <XCircle className="w-3 h-3" />
                            <span>{isClosingThis ? '...' : 'Close'}</span>
                          </button>
                        )}

                        {/* Open Full Detail */}
                        <button onClick={() => navigate(`/tickets/${t._id}`)}
                          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition">
                          <MessageSquare className="w-3 h-3" />
                          <span>Detail</span>
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
              <span>Page {page} of {totalPages} · {total} tickets</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Previous
                </button>
                {/* Page numbers for small ranges */}
                {totalPages <= 7 && Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${p === page ? 'bg-purple-600 text-white border border-purple-500' : 'border border-slate-800 hover:border-slate-600 text-slate-400'}`}>
                    {p}
                  </button>
                ))}
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