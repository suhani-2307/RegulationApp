import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth, newSessionId } from '../contexts/AuthContext'

export default function GreenRoutinePage() {
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const { emotion, location, sessionId } = (routeLocation.state as { emotion?: string | null; location?: string | null; sessionId?: string } | null) ?? {}
  const { logZoneEntry } = useAuth()
  const hasLogged = useRef(false)

  useEffect(() => {
    if (hasLogged.current) return
    hasLogged.current = true
    logZoneEntry({ zone: 'green', emotion: emotion ?? null, time: new Date(), location: location ?? undefined, sessionId: sessionId ?? newSessionId() })
  }, [emotion, location, sessionId, logZoneEntry])

  return (
    <div style={{
      backgroundColor: 'var(--bg)',
      minHeight: '100vh',
      padding: '40px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
          }}
          title="Back to dashboard"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M3 11l9-8 9 8" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700 }}>Check In</p>
        <ThemeToggle />
      </div>

      {/* Learning card */}
      <div style={{
        borderRadius: 18, backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 26 }}>🎓</div>
        <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em' }}>LEARNING</p>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Your mind is ready for focused tasks.</p>

        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
            I'm in the <span style={{ color: 'var(--green)' }}>GREEN</span>
          </p>
          <p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>I can...</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>Start learning</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 12, fontSize: 34 }}>
            <span>🌼</span>
            <span>💬</span>
          </div>
        </div>
      </div>

      {/* Keep going card */}
      <div style={{
        borderRadius: 18, backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em' }}>KEEP GOING</p>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Maintain this flow and check in again soon.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 6, fontSize: 34 }}>
          <span>🌼</span>
          <span>🎆</span>
        </div>
      </div>

      {/* Connect with others card */}
      <div style={{
        borderRadius: 18, backgroundColor: 'var(--surface2)',
        padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          💬
        </div>
        <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700 }}>Connect with Others</p>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.5 }}>
          Being in the Green Zone is a wonderful time to engage in social interaction or reach out to a friend.
        </p>
      </div>

      {/* Reflection check card */}
      <div style={{
        borderRadius: 18, backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🧘</span>
          <p style={{ color: 'var(--text)', fontSize: 15.5, fontWeight: 700 }}>Reflection Check</p>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          How does your body feel right now while in the green?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {['Calm Heart', 'Relaxed Shoulders', 'Easy Breathing'].map(item => (
            <div
              key={item}
              style={{
                padding: '12px 16px', borderRadius: 12, textAlign: 'center',
                backgroundColor: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 13.5, fontWeight: 500,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Finished for now card */}
      <div style={{
        borderRadius: 18, backgroundColor: 'var(--green)',
        padding: 22, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center',
      }}>
        <p style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Finished for now?</p>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 1.5 }}>
          You're doing great. You can return to your dashboard or explore more tools.
        </p>
      </div>
    </div>
  )
}
