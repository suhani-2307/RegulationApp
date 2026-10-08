import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth, newSessionId } from '../contexts/AuthContext'

const STEPS = [
  { id: 'breathe', label: 'Take 5 slow, deep breaths.', icon: '🌬️' },
  { id: 'sensory', label: 'Try a fidget or sensory tool.', icon: '🧴' },
  { id: 'eyes', label: 'Close your eyes for a moment.', icon: '🙈' },
]

export default function CalmingRoutinePage() {
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const { emotion, location, sessionId } = (routeLocation.state as { emotion?: string | null; location?: string | null; sessionId?: string } | null) ?? {}
  const { logZoneEntry } = useAuth()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState(false)

  function toggleStep(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleComplete() {
    if (completed) return
    logZoneEntry({ zone: 'red', emotion: emotion ?? null, time: new Date(), location: location ?? undefined, sessionId: sessionId ?? newSessionId() })
    setCompleted(true)
    // Loop back to zone selection until the user reports being in the green zone
    setTimeout(() => navigate('/zones', { state: { location, sessionId, recheck: true } }), 1000)
  }

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
          onClick={() => navigate('/zones', { state: { location, sessionId } })}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
          }}
          title="Back to zones"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700 }}>Check In</p>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          I'm in the <span style={{ color: 'var(--red)' }}>RED</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>I will...</p>
      </div>

      {/* Hero card */}
      <div style={{
        borderRadius: 20, backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>🧘</div>
        <p style={{ color: 'var(--red)', fontSize: 17, fontWeight: 700 }}>Calming Routine</p>
      </div>

      {/* Success flash */}
      {completed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12,
          backgroundColor: 'color-mix(in srgb, var(--green) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)',
        }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="var(--green)" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>Routine complete! Let's check in again...</p>
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STEPS.map(step => {
          const isChecked = checked.has(step.id)
          return (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 16, cursor: 'pointer',
                border: `2px solid ${isChecked ? 'var(--red)' : 'var(--border)'}`,
                backgroundColor: isChecked ? 'color-mix(in srgb, var(--red) 6%, transparent)' : 'var(--surface)',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                backgroundColor: 'color-mix(in srgb, var(--red) 14%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {step.icon}
              </div>
              <p style={{ flex: 1, color: 'var(--text)', fontSize: 14.5, fontWeight: 500 }}>{step.label}</p>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${isChecked ? 'var(--red)' : 'var(--border)'}`,
                backgroundColor: isChecked ? 'var(--red)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isChecked && (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={completed}
        style={{
          width: '100%', padding: '15px', borderRadius: 14,
          fontWeight: 600, fontSize: 15,
          backgroundColor: 'var(--red)', color: '#fff',
          border: 'none',
          opacity: completed ? 0.6 : 1,
          cursor: completed ? 'default' : 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        {completed ? 'Routine complete ✓' : 'Complete Routine'}
      </button>
    </div>
  )
}
