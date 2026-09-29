import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../api/tickets';
import { Navbar } from '../components/layout/Navbar';
import {
  Ticket,
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  History,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Tag,
  Flag,
  UserCheck,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';

export const TicketDetail = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(
    location.state?.message || null
  );

  // Active view tab: 'conversation' or 'history'
  const [activeTab, setActiveTab] = useState('conversation');

  // Reply Composer State
  const [replyBody, setReplyBody] = useState('');
  const [messageType, setMessageType] = useState('PUBLIC'); // 'PUBLIC' or 'INTERNAL_NOTE'
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [composerError, setComposerError] = useState(null);

  // Staff Quick Action State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch available agents for staff assignment
  useEffect(() => {
    if (role !== 'CUSTOMER') {
      const fetchStaff = async () => {
        try {
          const res = await ticketsApi.getAgents();
          if (res.success && res.data?.agents) {
            setAgents(res.data.agents);
          }
        } catch (e) {}
      };
      fetchStaff();
    }
  }, [role]);

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

  // Fetch Ticket Data
  const loadTicketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ticketRes, messagesRes, activityRes] = await Promise.all([
        ticketsApi.getTicket(id),
        ticketsApi.getMessages(id, { limit: 100 }),
        ticketsApi.getActivity(id),
      ]);

      if (ticketRes.success && ticketRes.data?.ticket) {
        setTicket(ticketRes.data.ticket);
        setSelectedAssignee(ticketRes.data.ticket.assignedTo?._id || '');
      }
      if (messagesRes.success && messagesRes.data?.messages) {
        setMessages(messagesRes.data.messages);
      }
      if (activityRes.success && activityRes.data?.activities) {
        setActivities(activityRes.data.activities);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to load ticket details'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  // Scroll to bottom of conversation
  useEffect(() => {
    if (activeTab === 'conversation' && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Handle Post Message (Public or Internal)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setIsSendingMessage(true);
    setComposerError(null);

    try {
      const payload = {
        body: replyBody.trim(),
        type: role === 'CUSTOMER' ? 'PUBLIC' : messageType,
      };

      const res = await ticketsApi.createMessage(ticket._id, payload);
      if (res.success && res.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setReplyBody('');
        // Reload activity to keep timeline synchronous
        const actRes = await ticketsApi.getActivity(ticket._id);
        if (actRes.success && actRes.data?.activities) {
          setActivities(actRes.data.activities);
        }
        // If status changed as part of reply automation, reload ticket
        const tickRes = await ticketsApi.getTicket(ticket._id);
        if (tickRes.success && tickRes.data?.ticket) {
          setTicket(tickRes.data.ticket);
        }
      }
    } catch (err) {
      setComposerError(
        err.response?.data?.message || err.message || 'Failed to send message'
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Staff Quick Action: Resolve
  const handleResolve = async () => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await ticketsApi.resolveTicket(ticket._id);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setActionSuccessMessage('Ticket resolved successfully');
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to resolve ticket');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Reopen
  const handleReopen = async () => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await ticketsApi.reopenTicket(ticket._id);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setActionSuccessMessage('Ticket reopened successfully');
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to reopen ticket');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Close
  const handleClose = async () => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await ticketsApi.closeTicket(ticket._id);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setActionSuccessMessage('Ticket closed');
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to close ticket');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Staff: Status Transition Dropdown
  const handleStatusChange = async (targetStatus) => {
    if (!targetStatus || targetStatus === ticket.status) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await ticketsApi.updateStatus(ticket._id, targetStatus);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setActionSuccessMessage(`Status updated to ${targetStatus}`);
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Status transition denied');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Staff: Priority Change
  const handlePriorityChange = async (targetPriority) => {
    if (!targetPriority || targetPriority === ticket.priority) return;
    try {
      const res = await ticketsApi.updateTicket(ticket._id, { priority: targetPriority });
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setActionSuccessMessage(`Priority updated to ${targetPriority}`);
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to update priority');
    }
  };

  // Staff: Self-assign ticket
  const handleClaimTicket = async () => {
    try {
      const res = await ticketsApi.assignTicket(ticket._id, user._id || user.id);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setSelectedAssignee(user._id || user.id);
        setActionSuccessMessage('You have successfully claimed this ticket');
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to claim ticket');
    }
  };

  // Staff: Assign or reassign ticket to chosen agent or unassign
  const handleAssignAgent = async () => {
    setIsAssigning(true);
    setStatusMessage(null);
    try {
      const res = await ticketsApi.assignTicket(ticket._id, selectedAssignee || null);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
        setSelectedAssignee(res.data.ticket.assignedTo?._id || '');
        setActionSuccessMessage(
          selectedAssignee ? 'Ticket assignment updated successfully' : 'Ticket unassigned'
        );
        loadTicketData();
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setIsAssigning(false);
    }
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

  const formatActivityText = (act) => {
    switch (act.action) {
      case 'TICKET_CREATED':
        return 'Ticket created by requester';
      case 'TICKET_ASSIGNED':
      case 'ASSIGNED':
        return `Assigned to ${act.newValue || 'Agent'}`;
      case 'TICKET_REASSIGNED':
      case 'REASSIGNED':
        return `Reassigned from ${act.oldValue || 'previous'} to ${act.newValue || 'new agent'}`;
      case 'PRIORITY_CHANGED':
        return `Priority modified: ${act.oldValue} → ${act.newValue}`;
      case 'CATEGORY_CHANGED':
        return `Category modified to ${act.newValue}`;
      case 'STATUS_CHANGED':
        return `Status transitioned: ${act.oldValue} → ${act.newValue}`;
      case 'PUBLIC_REPLY_ADDED':
      case 'PUBLIC_REPLY':
        return 'Public message posted';
      case 'INTERNAL_NOTE_ADDED':
      case 'INTERNAL_NOTE':
        return 'Staff internal note added';
      case 'TICKET_RESOLVED':
      case 'RESOLVED':
        return 'Ticket marked as RESOLVED';
      case 'TICKET_REOPENED':
      case 'REOPENED':
        return 'Ticket REOPENED';
      case 'TICKET_CLOSED':
      case 'CLOSED':
        return 'Ticket marked as CLOSED';
      default:
        return act.action.replace(/_/g, ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-semibold">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-950/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Ticket Unavailable</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto">{error || 'Ticket not found'}</p>
          <Link
            to="/tickets"
            className="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Return to Tickets
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link to="/tickets" className="hover:text-white flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tickets</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-blue-400 font-bold">{ticket.ticketNumber}</span>
          </div>

          <button
            onClick={loadTicketData}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Action Alerts */}
        {actionSuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              ✕
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-amber-400 hover:text-amber-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Ticket Header Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-black text-sm text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2.5 py-0.5 rounded-lg">
                  {ticket.ticketNumber}
                </span>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    statusStyles[ticket.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border ${
                    priorityStyles[ticket.priority] || 'text-slate-400 bg-slate-900 border-slate-800'
                  }`}
                >
                  {ticket.priority} Priority
                </span>

                <span className="text-[10px] text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {ticket.category?.name || 'General Inquiry'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {ticket.title || ticket.subject}
              </h1>
            </div>

            {/* Staff Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              {/* If staff and unassigned, claim button */}
              {role !== 'CUSTOMER' && !ticket.assignedTo && (
                <button
                  onClick={handleClaimTicket}
                  disabled={isUpdatingStatus}
                  className="flex items-center space-x-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold py-2 px-3 rounded-xl transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Claim Ticket</span>
                </button>
              )}

              {/* Status Controls */}
              {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                <button
                  onClick={handleResolve}
                  disabled={isUpdatingStatus}
                  className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold py-2 px-3 rounded-xl transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              )}

              {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                <button
                  onClick={handleReopen}
                  disabled={isUpdatingStatus}
                  className="flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold py-2 px-3 rounded-xl transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reopen</span>
                </button>
              )}

              {role !== 'CUSTOMER' && ticket.status !== 'CLOSED' && (
                <button
                  onClick={handleClose}
                  disabled={isUpdatingStatus}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl transition"
                >
                  <span>Close</span>
                </button>
              )}
            </div>
          </div>

          {/* Ticket Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Requester</div>
              <div className="font-semibold text-slate-200 mt-0.5 truncate">
                {ticket.requesterId?.fullName || ticket.requesterEmail}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{ticket.requesterEmail}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Assigned Agent</div>
              <div className="font-semibold text-slate-200 mt-0.5 truncate">
                {ticket.assignedTo ? ticket.assignedTo.fullName : 'Unassigned'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {ticket.assignedTo?.email || 'Awaiting assignment'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Created At</div>
              <div className="font-semibold text-slate-200 mt-0.5">{formatDate(ticket.createdAt)}</div>
              <div className="text-[10px] text-slate-500">Sequential DB Index</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Last Activity</div>
              <div className="font-semibold text-slate-200 mt-0.5">{formatDate(ticket.lastMessageAt || ticket.updatedAt)}</div>
              <div className="text-[10px] text-slate-500">
                {ticket.resolvedAt ? `Resolved: ${formatDate(ticket.resolvedAt)}` : 'Active thread'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Thread / Timeline & Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Column: Conversation Thread or Audit History */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('conversation')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'conversation'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Conversation ({messages.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Timeline ({activities.length})</span>
              </button>
            </div>

            {/* TAB 1: CONVERSATION THREAD */}
            {activeTab === 'conversation' && (
              <div className="space-y-4">
                {/* Messages Container */}
                <div className="space-y-4">
                  {messages.map((m) => {
                    const isInternal =
                      m.type === 'INTERNAL' ||
                      m.type === 'INTERNAL_NOTE' ||
                      m.visibility === 'INTERNAL';
                    const isSelf =
                      m.senderId?._id === user._id ||
                      m.senderId?._id === user.id ||
                      m.senderEmail === user.email;

                    return (
                      <div
                        key={m._id}
                        className={`rounded-2xl p-5 border transition ${
                          isInternal
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : isSelf
                            ? 'bg-blue-950/20 border-blue-500/30'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        {/* Message Sender Header */}
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-[11px] border border-slate-700">
                              {m.senderId?.fullName ? m.senderId.fullName[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {m.senderId?.fullName || m.senderEmail}
                              </div>
                              <div className="text-[10px] text-slate-500">{m.senderEmail}</div>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                m.senderRole === 'ADMIN'
                                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                                  : m.senderRole === 'AGENT'
                                  ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
                                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                              }`}
                            >
                              {m.senderRole}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            {isInternal && (
                              <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">
                                <Lock className="w-3 h-3" />
                                <span>Internal Note</span>
                              </span>
                            )}
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(m.createdAt)}</span>
                          </div>
                        </div>

                        {/* Message Body */}
                        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap pl-9">
                          {m.body || m.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Compose Response
                    </span>

                    {/* Staff Mode Switcher: Public Reply vs Internal Note */}
                    {role !== 'CUSTOMER' && (
                      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setMessageType('PUBLIC')}
                          className={`px-3 py-1 rounded-lg font-semibold transition ${
                            messageType === 'PUBLIC'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Public Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessageType('INTERNAL_NOTE')}
                          className={`px-3 py-1 rounded-lg font-semibold flex items-center space-x-1 transition ${
                            messageType === 'INTERNAL_NOTE'
                              ? 'bg-amber-600 text-white'
                              : 'text-amber-400/80 hover:text-amber-300'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>Internal Note</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {composerError && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                      {composerError}
                    </div>
                  )}

                  {messageType === 'INTERNAL_NOTE' && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>This note is strictly confidential and visible to Support Staff only. Customers will not see this.</span>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={
                      messageType === 'INTERNAL_NOTE'
                        ? 'Write an internal note for your support team...'
                        : 'Write your reply to the customer...'
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      Markdown supported &bull; Append-only audit record
                    </span>

                    <button
                      type="submit"
                      disabled={isSendingMessage || !replyBody.trim()}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition ${
                        messageType === 'INTERNAL_NOTE'
                          ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingMessage ? 'Posting...' : messageType === 'INTERNAL_NOTE' ? 'Add Internal Note' : 'Send Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: AUDIT ACTIVITY TIMELINE */}
            {activeTab === 'history' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Immutable Activity Timeline</h3>
                    <p className="text-xs text-slate-400">Append-only audit events logged by the core state machine.</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {activities.length} Recorded Events
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activities.map((act) => (
                    <div key={act._id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-950 group-hover:scale-125 transition-transform" />

                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            {formatActivityText(act)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatDate(act.createdAt)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center space-x-2">
                          <span>Actor:</span>
                          <span className="text-slate-200 font-medium">
                            {act.actorId?.fullName || act.actorEmail || 'System Engine'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {act.actorRole}
                          </span>
                        </div>

                        {act.oldValue && act.newValue && (
                          <div className="text-[11px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/60 text-slate-400 flex items-center space-x-2">
                            <span className="line-through text-rose-400/80">{act.oldValue}</span>
                            <span>→</span>
                            <span className="text-emerald-400 font-semibold">{act.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ticket Controls & Metadata Details */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            {role !== 'CUSTOMER' && (
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Staff Ticket Controls
                </h3>

                {/* Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Change Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REOPENED">REOPENED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Adjust Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                {/* Assignment Management */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <label className="text-xs text-slate-400">Assigned Agent</label>
                  <div className="space-y-2">
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      disabled={isAssigning}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((ag) => (
                        <option key={ag._id} value={ag._id}>
                          {ag.fullName} ({ag.role})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAssignAgent}
                      disabled={isAssigning || selectedAssignee === (ticket.assignedTo?._id || '')}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{ticket.assignedTo ? 'Reassign Ticket' : 'Assign Ticket'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Requester Information */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Customer Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Full Name:</span>
                  <div className="font-semibold text-white">{ticket.requesterId?.fullName || 'Customer'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Email Address:</span>
                  <div className="font-mono text-slate-300 truncate">{ticket.requesterEmail}</div>
                </div>
                {ticket.requesterId?.phone && (
                  <div>
                    <span className="text-slate-500">Phone Number:</span>
                    <div className="font-mono text-slate-300">{ticket.requesterId.phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Initial Request Description */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original Request
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
