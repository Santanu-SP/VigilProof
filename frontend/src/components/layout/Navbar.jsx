import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Shield, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

const NAV_LINKS = [
  { label: 'Platform',      href: '/#how-it-works' },
  { label: 'Products',      href: '/#why-vigilproof' },
  { label: 'Industries',    href: '/#safety' },
  { label: 'Pricing',       href: '/#pricing' },
  { label: 'Company',       href: '/#company' },
  { label: 'Contact Sales', href: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const initials = isAuthenticated && user ? (user.name || user.email || '?').charAt(0).toUpperCase() : '';

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.nav
        id="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          zIndex: 100,
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          background: scrolled ? 'rgba(0,0,0,0.75)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* ── Logo ── */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Link
              to="/"
              id="navbar-logo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <Shield
                size={22}
                style={{ color: '#22c55e', filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }}
              />
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                }}
              >
                Vigil<span style={{ color: '#22c55e' }}>Proof</span>
              </span>
            </Link>
          </div>

          {/* ── Center nav links (desktop) ── */}
          <nav
            aria-label="Primary navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
            className="hidden lg:flex"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                id={`nav-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'color 0.2s, background 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* ── Right auth actions (desktop) ── */}
          <div
            className="hidden lg:flex"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/investigate"
                  style={{
                    padding: '7px 18px',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Investigate
                </Link>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      width: 34, height: 34,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      border: 'none',
                      color: '#000',
                      fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(34,197,94,0.3)',
                    }}
                  >
                    {initials}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                          position: 'absolute',
                          top: '100%', right: 0,
                          marginTop: 8,
                          width: 200,
                          background: 'rgba(9,9,11,0.9)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          overflow: 'hidden',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        }}
                      >
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px', color: '#fff', textDecoration: 'none',
                            fontSize: '0.85rem', fontWeight: 500,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <User size={16} /> Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px', color: '#f87171', textDecoration: 'none',
                            fontSize: '0.85rem', fontWeight: 500,
                            background: 'transparent', border: 'none',
                            cursor: 'pointer', textAlign: 'left',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  id="navbar-sign-in"
                  style={{
                    padding: '7px 18px',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Sign In
                </Link>

                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/investigate"
                    id="navbar-book-demo"
                    style={{
                      display: 'inline-block',
                      padding: '7px 20px',
                      fontSize: '0.83rem',
                      fontWeight: 700,
                      color: '#000000',
                      textDecoration: 'none',
                      borderRadius: '9999px',
                      background: '#22c55e',
                      boxShadow: '0 0 16px rgba(34,197,94,0.4)',
                      transition: 'background 0.2s, box-shadow 0.2s',
                      border: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#16a34a';
                      e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,0.65)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#22c55e';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(34,197,94,0.4)';
                    }}
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }} className="lg:hidden">
            <button
              id="navbar-mobile-toggle"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'rgba(255,255,255,0.8)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
            <motion.span
              animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 11 : 0 }}
              style={{ width: 22, height: 2, background: 'currentColor', borderRadius: 2, display: 'block', transformOrigin: 'center', transition: 'transform 0.3s' }}
            />
            <motion.span
              animate={{ opacity: mobileOpen ? 0 : 1 }}
              style={{ width: 22, height: 2, background: 'currentColor', borderRadius: 2, display: 'block' }}
            />
            <motion.span
              animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -11 : 0 }}
              style={{ width: 22, height: 2, background: 'currentColor', borderRadius: 2, display: 'block', transformOrigin: 'center', transition: 'transform 0.3s' }}
            />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: 'rgba(0,0,0,0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px',
            gap: '8px',
            overflowY: 'auto',
          }}
        >
          {NAV_LINKS.map(({ label, href }, i) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {label}
            </motion.a>
          ))}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '14px', textAlign: 'center',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', textDecoration: 'none', fontWeight: 600,
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); navigate('/'); }}
                  style={{
                    padding: '14px', textAlign: 'center',
                    borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '14px', textAlign: 'center',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', textDecoration: 'none', fontWeight: 600,
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/investigate"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '14px', textAlign: 'center',
                    borderRadius: '12px', background: '#22c55e',
                    color: '#000', textDecoration: 'none', fontWeight: 700,
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
