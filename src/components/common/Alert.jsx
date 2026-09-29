import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'error', message, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-sky-950/40 border-sky-500/30 text-sky-300',
      icon: <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />,
    },
  };

  const current = styles[type] || styles.error;

  return (
    <div
      className={`flex items-start justify-between p-3.5 rounded-xl border ${current.bg} text-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {current.icon}
        <div className="leading-snug pt-0.5">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
