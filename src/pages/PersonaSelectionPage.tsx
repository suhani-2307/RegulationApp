import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function PersonaSelectionPage() {
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '48px 24px 40px', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <ThemeToggle />
      </div>

      <div style={{ marginBottom: 40 }}>
        <p style={{ color: 'var(--blue)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
          Zones of Regulation
        </p>
        <h1 style={{ color: 'var(--text)', fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Welcome</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>How are you using this app?</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* Individual card */}
        <button
          onClick={() => navigate('/signup')}
          style={{
            flex: 1, textAlign: 'left', padding: 24, backgroundColor: 'var(--surface)',
            borderRadius: 12, border: '1px solid var(--border)', transition: 'border-color 0.15s',
            display: 'flex', flexDirection: 'column',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--blue) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="var(--blue)" strokeWidth="1.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ color: 'var(--text)', fontSize: 17, fontWeight: 600, marginBottom: 6 }}>I'm an Individual</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, flex: 1 }}>
            Track your emotional zones and connect with your caregiver
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, color: 'var(--blue)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Get started</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {/* Caregiver card */}
        <button
          onClick={() => navigate('/caregiver-signup')}
          style={{
            flex: 1, textAlign: 'left', padding: 24, backgroundColor: 'var(--surface)',
            borderRadius: 12, border: '1px solid var(--border)', transition: 'border-color 0.15s',
            display: 'flex', flexDirection: 'column',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--green) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="9" cy="7" r="3" stroke="var(--green)" strokeWidth="1.5" />
              <circle cx="16.5" cy="9" r="2.5" stroke="var(--green)" strokeWidth="1.5" />
              <path d="M2 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 14.5c1.7.7 3 2.2 3 4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ color: 'var(--text)', fontSize: 17, fontWeight: 600, marginBottom: 6 }}>I'm a Caregiver</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, flex: 1 }}>
            Monitor and support the individuals in your care
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, color: 'var(--green)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Get started</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 32 }}>
        Already have an account?{' '}
        <button
          onClick={() => navigate('/signin')}
          style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
