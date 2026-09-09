import React from 'react';
import type { UserPersona, UserRole } from '../../types';
import { Shield, ArrowRight, Lock } from 'lucide-react';

interface UserSwitchAuthModalProps {
  isOpen: boolean;
  candidatePersona: UserPersona | null;
  onClose: () => void;
  onConfirmSwitch: (persona: UserPersona, role: UserRole) => void;
}

// Demo persona IDs map to server demo-login endpoint
const PERSONA_ID_MAP: Record<string, string> = {
  'priya.iyer@mospi.gov.in': 'demo_admin',
  'rajesh.kumar@jsu.gov.in': 'demo_learner',
  'anita.sharma@gov.in': 'demo_judge',
};

export const UserSwitchAuthModal: React.FC<UserSwitchAuthModalProps> = ({
  isOpen,
  candidatePersona,
  onClose,
  onConfirmSwitch,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  if (!isOpen || !candidatePersona) return null;

  const handleSwitch = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const personaId = PERSONA_ID_MAP[candidatePersona.email];
      if (!personaId) throw new Error('Unknown persona');

      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Switch failed');

      localStorage.setItem('stackconnect_token', data.token);
      localStorage.setItem('stackconnect_auth', 'true');

      const role: UserRole = candidatePersona.userRole === 'admin' ? 'admin' : 'employee';
      onConfirmSwitch(candidatePersona, role);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to switch user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="eng-card max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Switch User Session</h3>
              <p className="text-[11px] opacity-70 font-medium">Server-side JWT authentication</p>
            </div>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 font-bold text-sm cursor-pointer">✕</button>
        </div>

        {/* Selected Persona Card */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3.5">
          <img
            src={candidatePersona.avatarUrl}
            alt={candidatePersona.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50 shadow-sm"
          />
          <div>
            <h4 className="font-bold text-sm text-emerald-500">{candidatePersona.name}</h4>
            <p className="text-xs opacity-80 font-medium">{candidatePersona.designation}</p>
            <p className="text-[10px] opacity-60 font-mono mt-0.5">{candidatePersona.email}</p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl eng-card hover:border-slate-400 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSwitch}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Switch User'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
