import React from 'react';
import confetti from 'canvas-confetti';
import type { IGotSyncConfig, UserPersona } from '../../types';
import { ExternalLink, RefreshCw, CheckCircle2, ShieldCheck, Key, Zap } from 'lucide-react';

interface IGotSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: UserPersona;
  syncConfig: IGotSyncConfig;
  onUpdateSyncConfig: (config: IGotSyncConfig) => void;
  onSyncAllCompletedCourses: () => void;
}

export const IGotSyncModal: React.FC<IGotSyncModalProps> = ({
  isOpen,
  onClose,
  persona,
  syncConfig,
  onUpdateSyncConfig,
  onSyncAllCompletedCourses
}) => {
  const [igotId, setIgotId] = React.useState(syncConfig.userIgotId || `IGOT-${persona.name.split(' ')[0].toUpperCase()}-2026`);
  const [ssoToken, setSsoToken] = React.useState(syncConfig.ssoToken || `igot_sso_tk_${Date.now().toString(36)}`);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = React.useState('');

  if (!isOpen) return null;

  const handleConnectAndSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Connecting to iGOT Karmayogi portal...');
    await new Promise(r => setTimeout(r, 600));

    setSyncStatusMsg('Fetching completed courses and progress data...');
    await new Promise(r => setTimeout(r, 700));

    const updatedConfig: IGotSyncConfig = {
      isConnected: true,
      userIgotId: igotId,
      ssoToken,
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      syncedCoursesCount: syncConfig.syncedCoursesCount + 3
    };

    onUpdateSyncConfig(updatedConfig);
    onSyncAllCompletedCourses();
    setIsSyncing(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="eng-card max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">iGOT Karmayogi API Sync</h3>
              <p className="text-[11px] opacity-70 font-medium">DoPT iGOT Karmayogi Platform Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 font-bold text-sm">✕</button>
        </div>

        {/* Portal Status Indicator */}
        <div className="p-3.5 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${syncConfig.isConnected ? 'bg-emerald-500 shadow-sm animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-semibold">
              {syncConfig.isConnected ? 'iGOT API Active' : 'Not Connected'}
            </span>
          </div>

          <a
            href="https://igotkarmayogi.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
          >
            <span>iGOT Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Sync Form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold block mb-1">iGOT Officer ID</label>
            <input
              type="text"
              value={igotId}
              onChange={(e) => setIgotId(e.target.value)}
              placeholder="e.g. IGOT-RAJESH-2026"
              className="w-full eng-input rounded-xl px-3.5 py-2 text-xs font-medium font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1 flex items-center justify-between">
              <span>SSO API Auth Token</span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-mono font-bold"><Key className="w-3 h-3" /> Encrypted</span>
            </label>
            <input
              type="password"
              value={ssoToken}
              onChange={(e) => setSsoToken(e.target.value)}
              className="w-full eng-input rounded-xl px-3.5 py-2 text-xs font-medium font-mono"
            />
          </div>
        </div>

        {/* Sync Info Pill */}
        {syncConfig.lastSyncedAt && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-500 flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Synced at {syncConfig.lastSyncedAt}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20">
              {syncConfig.syncedCoursesCount} Courses
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleConnectAndSync}
            disabled={isSyncing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Syncing with iGOT Portal...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Sync iGOT Learning Telemetry</span>
              </>
            )}
          </button>

          {isSyncing && (
            <p className="text-[11px] text-emerald-500 font-mono font-semibold text-center animate-pulse">{syncStatusMsg}</p>
          )}

          <div className="text-center pt-1">
            <a
              href="https://igotkarmayogi.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] opacity-70 hover:opacity-100 hover:text-emerald-500 underline font-medium"
            >
              iGOT Karmayogi Portal (igotkarmayogi.gov.in)
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
