/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Toast Context ──
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

// ── Confirm Context ──
const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be inside ToastProvider');
  return ctx;
}

// ── Icons per type ──
const icons = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const colors = {
  success: { bg: 'linear-gradient(135deg, #059669, #10b981)', border: '#34d399', shadow: 'rgba(16,185,129,0.35)' },
  error: { bg: 'linear-gradient(135deg, #dc2626, #ef4444)', border: '#f87171', shadow: 'rgba(239,68,68,0.35)' },
  warning: { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', border: '#fbbf24', shadow: 'rgba(245,158,11,0.35)' },
  info: { bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: '#60a5fa', shadow: 'rgba(59,130,246,0.35)' },
};

// ── Single Toast ──
function ToastItem({ id, message, type = 'success', onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(id), 350);
    }, 3500);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const c = colors[type] || colors.info;

  return (
    <div
      style={{
        background: c.bg,
        borderLeft: `4px solid ${c.border}`,
        boxShadow: `0 8px 32px ${c.shadow}, 0 2px 8px rgba(0,0,0,0.12)`,
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#fff',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: '280px',
        maxWidth: '420px',
        backdropFilter: 'blur(12px)',
        animation: isExiting ? 'toast-out 0.35s ease forwards' : 'toast-in 0.4s cubic-bezier(.21,1.02,.73,1) forwards',
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
      onClick={() => { setIsExiting(true); setTimeout(() => onRemove(id), 350); }}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{icons[type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <X size={16} style={{ flexShrink: 0, opacity: 0.7, cursor: 'pointer' }} />
    </div>
  );
}

// ── Confirm Modal ──
function ConfirmModal({ title, message, confirmText, cancelText, type, onConfirm, onCancel }) {
  const [isExiting, setIsExiting] = useState(false);
  const c = colors[type] || colors.warning;

  const handleConfirm = () => { setIsExiting(true); setTimeout(onConfirm, 250); };
  const handleCancel = () => { setIsExiting(true); setTimeout(onCancel, 250); };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        animation: isExiting ? 'confirm-bg-out 0.25s ease forwards' : 'confirm-bg-in 0.25s ease forwards',
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          animation: isExiting ? 'confirm-out 0.25s ease forwards' : 'confirm-in 0.3s cubic-bezier(.21,1.02,.73,1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            {icons[type] || icons.warning}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{title}</div>
          </div>
        </div>

        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px', paddingLeft: '2px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '9px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
              border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.background = '#e2e8f0'; }}
            onMouseLeave={e => { e.target.style.background = '#f8fafc'; }}
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '9px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
              border: 'none', background: c.bg, color: '#fff', cursor: 'pointer',
              boxShadow: `0 4px 14px ${c.shadow}`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 20px ${c.shadow}`; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 14px ${c.shadow}`; }}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Global CSS injector ──
const styleId = 'toast-animations';
function injectStyles() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes toast-in {
      0% { opacity: 0; transform: translateX(80px) scale(0.85); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes toast-out {
      0% { opacity: 1; transform: translateX(0) scale(1); }
      100% { opacity: 0; transform: translateX(80px) scale(0.85); }
    }
    @keyframes confirm-bg-in {
      0% { opacity: 0; } 100% { opacity: 1; }
    }
    @keyframes confirm-bg-out {
      0% { opacity: 1; } 100% { opacity: 0; }
    }
    @keyframes confirm-in {
      0% { opacity: 0; transform: scale(0.85) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes confirm-out {
      0% { opacity: 1; transform: scale(1) translateY(0); }
      100% { opacity: 0; transform: scale(0.85) translateY(20px); }
    }
  `;
  document.head.appendChild(style);
}

// ── Provider ──
let nextId = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => { injectStyles(); }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const confirm = useCallback(({ title, message, confirmText, cancelText, type = 'warning' }) => {
    return new Promise((resolve) => {
      setConfirmState({ title, message, confirmText, cancelText, type, resolve });
    });
  }, []);

  const handleConfirm = () => { confirmState?.resolve(true); setConfirmState(null); };
  const handleCancel = () => { confirmState?.resolve(false); setConfirmState(null); };

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        {/* Toast container */}
        {createPortal(
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 99998,
            display: 'flex', flexDirection: 'column', gap: '10px',
            pointerEvents: 'none',
          }}>
            {toasts.map(t => (
              <ToastItem key={t.id} {...t} onRemove={removeToast} />
            ))}
          </div>,
          document.body
        )}

        {/* Confirm dialog */}
        {confirmState && (
          <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}
