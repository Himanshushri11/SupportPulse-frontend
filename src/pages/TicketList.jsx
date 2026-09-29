import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../api/tickets';
import { Navbar } from '../components/layout/Navbar';
import {
  Ticket,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  User,
  Shield,
  Tag,
} from 'lucide-react';

export const TicketList = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch Categories and Agents for Filter Dropdown
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await ticketsApi.getCategories();
        if (catRes.success && catRes.data?.categories) {
          setCategories(catRes.data.categories);
        }
      } catch (e) {}

      if (role !== 'CUSTOMER') {
        try {
          const agentRes = await ticketsApi.getAgents();
          if (agentRes.success && agentRes.data?.agents) {
            setAgents(agentRes.data.agents);
          }
        } catch (e) {}
      }
    };
    fetchMetadata();
  }, [role]);

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await ticketsApi.getTickets(params);
      if (res.success && res.data) {
        setTickets(res.data.tickets || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter, categoryFilter, assignedFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setAssignedFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  // Status Styling Dictionary
  const statusStyles = {
    OPEN: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
    IN_PROGRESS: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    PENDING: 'bg-orange-950/70 border-orange-500/40 text-orange-300',
    RESOLVED: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    CLOSED: 'bg-slate-800 border-slate-700 text-slate-400',
    REOPENED: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
  };

  // Priority Styling Dictionary
  const priorityStyles = {
    LOW: 'text-slate-400 bg-slate-900 border-slate-800',
    MEDIUM: 'text-sky-400 bg-sky-950/50 border-sky-500/30',
    HIGH: 'text-amber-400 bg-amber-950/50 border-amber-500/30',
    URGENT: 'text-rose-400 bg-rose-950/50 border-rose-500/30 font-bold',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Support Tickets
              </h1>
              <span className="text-xs bg-slate-800/80 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                {totalCount} Total
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {role === 'CUSTOMER'
                ? 'Your personal support inquiries, status tracking, and responses.'
                : role === 'AGENT'
                ? 'Assigned agent queue, team investigations, and customer inquiries.'
                : 'Global organizational support queue, SLA management, and agent dispatches.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchTickets}
              disabled={isLoading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/tickets/new"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ticket</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket # (TKT-2026-000001), subject, or email..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REOPENED">Reopened</option>
                <option value="CLOSED">Closed</option>
              </select>

              {/* Priority */}
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 truncate"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Assigned Filter (Staff only) */}
              {role !== 'CUSTOMER' && (
                <select
                  value={assignedFilter}
                  onChange={(e) => {
                    setAssignedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Assignments</option>
                  <option value="me">Assigned to Me</option>
                  <option value="unassigned">Unassigned</option>
                  {agents.map((ag) => (
                    <option key={ag._id} value={ag._id}>
                      {ag.fullName} ({ag.role})
                    </option>
                  ))}
                </select>
              )}

              {/* Sorting Filter */}
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(':');
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="lastMessageAt:desc">Recent Activity</option>
                <option value="priority:desc">Priority High-Low</option>
                <option value="status:asc">Status</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Filter
            </button>

            {(search || statusFilter || priorityFilter || categoryFilter || assignedFilter || sortBy !== 'createdAt') && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div className="text-xs text-rose-300">{error}</div>
            </div>
            <button
              onClick={fetchTickets}
              className="text-xs text-rose-300 underline font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-xs">Loading support tickets...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tickets.length === 0 && (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Tickets Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {search || statusFilter || priorityFilter || categoryFilter || assignedFilter
                  ? 'No tickets match the selected filter criteria. Try clearing filters.'
                  : role === 'CUSTOMER'
                  ? 'You have not submitted any support tickets yet. Click "Create Ticket" to open your first inquiry.'
                  : 'There are currently no tickets in the support queue.'}
              </p>
            </div>
            {role === 'CUSTOMER' && (
              <Link
                to="/tickets/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Create Your First Ticket
              </Link>
            )}
          </div>
        )}

        {/* Tickets Table / List */}
        {!isLoading && !error && tickets.length > 0 && (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Category</th>
                    {role !== 'CUSTOMER' && <th className="py-3 px-4">Requester</th>}
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {tickets.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => navigate(`/tickets/${t._id}`)}
                      className="hover:bg-slate-900/60 cursor-pointer transition duration-150 group"
                    >
                      {/* Ticket Number */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-400 group-hover:text-sky-300 group-hover:underline">
                          {t.ticketNumber}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-white">
                        {t.title || t.subject}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            statusStyles[t.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            priorityStyles[t.priority] || 'text-slate-400 bg-slate-900 border-slate-800'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        {t.category?.name || 'General'}
                      </td>

                      {/* Requester (Staff only) */}
                      {role !== 'CUSTOMER' && (
                        <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                          <div className="font-medium">{t.requesterId?.fullName || 'Customer'}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{t.requesterEmail}</div>
                        </td>
                      )}

                      {/* Assigned Agent */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {t.assignedTo ? (
                          <span className="inline-flex items-center space-x-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span>{t.assignedTo.fullName || 'Agent'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400/90 italic font-medium">Unassigned</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDate(t.createdAt)}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDate(t.lastMessageAt || t.updatedAt)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition text-[11px] font-semibold">
                          {role === 'CUSTOMER' ? 'View' : 'Manage'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing page <span className="font-semibold text-white">{page}</span> of{' '}
                  <span className="font-semibold text-white">{totalPages}</span> ({totalCount} total)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
