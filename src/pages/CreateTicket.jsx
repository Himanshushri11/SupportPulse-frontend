import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketsApi } from '../api/tickets';
import { Navbar } from '../components/layout/Navbar';
import {
  Ticket,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Tag,
  Flag,
  FileText,
  Info,
} from 'lucide-react';

export const CreateTicket = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await ticketsApi.getCategories();
        if (res.success && res.data?.categories) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setCategoryId(res.data.categories[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to fetch support categories. Please refresh.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const validate = () => {
    const errs = {};
    if (!subject.trim()) {
      errs.subject = 'Subject is required';
    } else if (subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters';
    } else if (subject.trim().length > 200) {
      errs.subject = 'Subject cannot exceed 200 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errs.description = 'Please provide more details (at least 10 characters)';
    }

    if (!categoryId) {
      errs.categoryId = 'Please select a category';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await ticketsApi.createTicket({
        title: subject.trim(),
        subject: subject.trim(),
        description: description.trim(),
        categoryId,
        priority,
      });

      if (res.success && res.data?.ticket) {
        const ticketId = res.data.ticket._id;
        navigate(`/tickets/${ticketId}`, {
          state: { message: `Ticket ${res.data.ticket.ticketNumber} created successfully!` },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create ticket';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link to="/tickets" className="hover:text-white flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tickets</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200">New Inquiry</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create Support Ticket
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Provide specific information about your issue. Our support team will respond promptly.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center space-x-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl space-y-6">
          {/* Subject Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Ticket Subject <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (validationErrors.subject) setValidationErrors((v) => ({ ...v, subject: null }));
              }}
              placeholder="Brief summary of your inquiry or technical issue..."
              className={`w-full bg-slate-900/90 border ${
                validationErrors.subject ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
              } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition`}
            />
            {validationErrors.subject && (
              <p className="text-rose-400 text-xs">{validationErrors.subject}</p>
            )}
          </div>

          {/* Classification & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Department / Category <span className="text-rose-400">*</span></span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (validationErrors.categoryId) setValidationErrors((v) => ({ ...v, categoryId: null }));
                }}
                disabled={isLoadingCategories}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {isLoadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              {validationErrors.categoryId && (
                <p className="text-rose-400 text-xs">{validationErrors.categoryId}</p>
              )}
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Priority Level</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Low — General question or minor request</option>
                <option value="MEDIUM">Medium — Normal priority inquiry</option>
                <option value="HIGH">High — Impaired workflow or functionality</option>
                <option value="URGENT">Urgent — Critical system disruption</option>
              </select>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Detailed Description <span className="text-rose-400">*</span></span>
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) setValidationErrors((v) => ({ ...v, description: null }));
              }}
              placeholder="Describe what occurred, steps to reproduce, error codes, and your expected outcome..."
              className={`w-full bg-slate-900/90 border ${
                validationErrors.description ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
              } rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none transition leading-relaxed`}
            />
            {validationErrors.description && (
              <p className="text-rose-400 text-xs">{validationErrors.description}</p>
            )}
          </div>

          {/* Helpful Information Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">Automatic Tracking & Concurrency</p>
              <p className="mt-0.5">
                Submitting this ticket will generate a sequential ticket identifier (e.g. TKT-2026-000001) and initialize the conversation audit log.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
            <Link
              to="/tickets"
              className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Opening Ticket...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
