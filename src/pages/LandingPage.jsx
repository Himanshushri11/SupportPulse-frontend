import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Ticket,
  Shield,
  User,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  MessageSquare,
  History,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Headphones,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user, role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-white tracking-tight">SupportPulse</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
                SaaS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#hero" className="hover:text-blue-400 transition">
              Home
            </a>
            <a href="#features" className="hover:text-blue-400 transition">
              Features
            </a>
            <a href="#rbac" className="hover:text-blue-400 transition">
              Role-Based Access
            </a>
            <a href="#workflow" className="hover:text-blue-400 transition">
              How It Works
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-400 py-2 px-3 rounded-xl border border-slate-800 hover:border-rose-500/30 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-lg shadow-blue-600/20 transition transform hover:-translate-y-0.5"
                >
                  <span>Sign Up</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Role-Based Multi-Role Ticket Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Production-Ready Ticketing &amp; Email Support Platform
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Manage customer support tickets, conversations, assignments and support communication from one centralized platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Support Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm border border-slate-700/80 shadow-md transition transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Interactive Preview Card */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="font-mono text-xs text-slate-400 ml-2">Live Support Queue</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Backend RBAC Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-400">TKT-2026-000001</span>
                    <span className="px-2 py-0.5 text-[9px] rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                      OPEN
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">Login &amp; Password Reset Issue</div>
                  <div className="text-[11px] text-slate-400">Requester: Himanshu</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-400">TKT-2026-000002</span>
                    <span className="px-2 py-0.5 text-[9px] rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                      IN_PROGRESS
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">API Webhook Delivery Latency</div>
                  <div className="text-[11px] text-slate-400">Assigned: Rahul (Agent)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-400">TKT-2026-000003</span>
                    <span className="px-2 py-0.5 text-[9px] rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                      RESOLVED
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">Billing Tier Upgrade Confirmation</div>
                  <div className="text-[11px] text-slate-400">Solved by Support Specialist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Role-Based Authentication Section */}
      <section id="rbac" className="py-20 border-t border-slate-900 bg-slate-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hierarchical Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Role-Based Authentication
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Every user gets access to the features and actions allowed by their role. Permissions are strictly checked and enforced on every backend API request.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: CUSTOMER */}
            <div className="glass-panel p-7 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition flex flex-col justify-between group shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                    Tier 1 Access
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">CUSTOMER</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct requester access with private ticket scoping.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Create support tickets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Track own tickets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Reply to support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Follow ticket status</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <div className="text-[11px] text-slate-500 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  Cannot access other customers&apos; tickets or staff internal notes.
                </div>
              </div>
            </div>

            {/* Card 2: AGENT */}
            <div className="glass-panel p-7 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition flex flex-col justify-between group shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                    Staff Tier
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">AGENT</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Support specialists actively resolving customer tickets.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Manage authorized support tickets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Reply to customers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Add internal notes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Update ticket status</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Resolve tickets</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <div className="text-[11px] text-slate-500 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  Full conversation visibility including internal notes.
                </div>
              </div>
            </div>

            {/* Card 3: ADMIN */}
            <div className="glass-panel p-7 rounded-2xl border border-slate-800/80 hover:border-purple-500/40 transition flex flex-col justify-between group shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                    Full Administrative Tier
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">ADMIN</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Global oversight, dispatch control, and ticket governance.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>View all tickets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Assign/reassign tickets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Manage support workflow</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Manage categories</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Administrative functions</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <div className="text-[11px] text-slate-500 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  Global queue oversight across all customers and agents.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="workflow" className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Clear Support Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-400 text-sm">
              Simple 4-step workflow from account registration to closed resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3 relative group hover:border-slate-700 transition">
              <span className="font-mono text-3xl font-black text-blue-500/40 group-hover:text-blue-400 transition">
                01
              </span>
              <h4 className="text-base font-bold text-white">Register / Login</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with credentials or passwordless OTP email verification. Roles are assigned securely.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3 relative group hover:border-slate-700 transition">
              <span className="font-mono text-3xl font-black text-sky-500/40 group-hover:text-sky-400 transition">
                02
              </span>
              <h4 className="text-base font-bold text-white">Create or receive ticket</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A customer submits an issue with title, description, and classification. It enters the central queue.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3 relative group hover:border-slate-700 transition">
              <span className="font-mono text-3xl font-black text-indigo-500/40 group-hover:text-indigo-400 transition">
                03
              </span>
              <h4 className="text-base font-bold text-white">Communicate via thread</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Exchange public replies with customers or log internal notes for team investigations.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3 relative group hover:border-slate-700 transition">
              <span className="font-mono text-3xl font-black text-emerald-500/40 group-hover:text-emerald-400 transition">
                04
              </span>
              <h4 className="text-base font-bold text-white">Resolve &amp; track history</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transition through state-machine lifecycle while immutable activity events log every action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Enterprise Support Capabilities
            </h2>
            <p className="text-slate-400 text-sm">
              Engineered with security, concurrency safety, and full traceability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Ticket Management</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sequential identifiers, multi-criteria filtering, search, pagination, and classification categories.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950/70 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Conversation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full two-way customer messaging with staff-only internal notes protected at the database query level.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Role-Based Access</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                CUSTOMER, AGENT, and ADMIN authority boundaries enforced strictly by backend middleware.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Ticket History</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Append-only audit trail logging assignment, status change, priority changes, and sender actions.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Support Dashboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time MongoDB aggregation metrics for open, in-progress, pending, resolved, and closed queues.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Email Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                OTP security dispatch, passwordless login authentication, and enterprise communication delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-300">SupportPulse</span>
            <span>&bull; Production-Ready Support System</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <Link to="/login" className="hover:text-white transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-white transition">
              Register
            </Link>
            <Link to="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} SupportPulse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
