import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

const OPTIONS = [
  { id: 'break', label: 'Take a break', icon: '⏱️' },
  { id: 'story', label: 'Read a social story', icon: '📖' },
]

export default function YellowRoutinePage() {
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const { emotion, location } = (routeLocation.state as { emotion?: string | null; location?: string | null } | null) ?? {}
  const { logZoneEntry } = useAuth()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState(false)

  function toggleOption(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleComplete() {
    if (completed) return
    logZoneEntry({ zone: 'yellow', emotion: emotion ?? null, time: new Date(), location: location ?? undefined })
    setCompleted(true)
    setTimeout(() => navigate('/dashboard'), 1000)
  }

  const canComplete = selected.size > 0

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
          onClick={() => navigate('/zones')}
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
        <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700 }}>
          I'm in the <span style={{ color: 'var(--yellow)' }}>YELLOW</span>
        </h1>
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
          <p style={{ color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>Routine complete! Heading home...</p>
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {OPTIONS.map(option => {
          const isSelected = selected.has(option.id)
          return (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                padding: '32px 20px', borderRadius: 18, cursor: 'pointer',
                border: `2px solid ${isSelected ? 'var(--yellow)' : 'var(--border)'}`,
                backgroundColor: isSelected ? 'color-mix(in srgb, var(--yellow) 8%, transparent)' : 'var(--surface)',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: 'color-mix(in srgb, var(--yellow) 16%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30,
              }}>
                {option.icon}
              </div>
              <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700 }}>{option.label}</p>
            </div>
          )
        })}
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={!canComplete || completed}
        style={{
          width: '100%', padding: '15px', borderRadius: 14,
          fontWeight: 600, fontSize: 15,
          backgroundColor: 'var(--yellow)', color: '#1a1a00',
          border: 'none',
          opacity: completed ? 0.6 : canComplete ? 1 : 0.35,
          cursor: completed || !canComplete ? 'default' : 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        {completed ? 'Routine complete ✓' : 'Complete Routine'}
      </button>
    </div>
  )
}
