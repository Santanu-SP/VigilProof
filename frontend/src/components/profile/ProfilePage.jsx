import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Edit2, Check, X, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, updateDisplayName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateDisplayName(nameInput.trim());
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,0.04) 0%, transparent 60%), #09090b',
        padding: '120px 24px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 540 }}
      >
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/investigate" style={{
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'monospace',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← Back to Investigation
          </Link>
        </div>

        {/* Profile Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header Banner */}
          <div style={{ height: 100, background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.02))', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />
          </div>

          <div style={{ padding: '0 32px 32px', position: 'relative' }}>
            {/* Avatar */}
            <div
              style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: '#09090b',
                border: '4px solid #09090b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -40,
                marginBottom: 24,
                position: 'relative',
                boxShadow: '0 0 20px rgba(34,197,94,0.2)',
              }}
            >
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 800, color: '#000',
              }}>
                {initials}
              </div>
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Display Name
                </label>
                {editing ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      disabled={saving}
                      style={{
                        flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(34,197,94,0.5)', borderRadius: 8,
                        color: '#fff', fontSize: '1.2rem', fontWeight: 600, outline: 'none'
                      }}
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={saving} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: 8, color: '#000', cursor: 'pointer' }}>
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditing(false)} disabled={saving} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 8, color: '#fff', cursor: 'pointer' }}>
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {user.name || 'Anonymous User'}
                    </h2>
                    <button
                      onClick={() => { setNameInput(user.name || ''); setEditing(true); }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}
                      title="Edit name"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
                {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>{error}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                    {user.email}
                  </span>
                  {user.emailVerified ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 999, fontSize: '0.7rem', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase' }}>
                      <BadgeCheck size={12} /> Verified
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 999, fontSize: '0.7rem', color: '#f87171', fontWeight: 600, textTransform: 'uppercase' }}>
                      Unverified
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: '20px 32px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10,
                color: '#f87171',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            >
              <LogOut size={16} />
              Sign Out
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
