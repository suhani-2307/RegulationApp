import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

type LocationId = 'home' | 'cech' | 'work' | 'other'

const LOCATIONS: { id: LocationId; label: string; description: string; icon: string }[] = [
  { id: 'home', label: 'Home', description: 'Your safe and familiar private space.', icon: '🏠' },
  { id: 'cech', label: 'CECH', description: 'Campus building for learning and growth.', icon: '🏢' },
  { id: 'work', label: 'Work', description: 'Productive environment and focus tasks.', icon: '💼' },
  { id: 'other', label: 'Other', description: 'Somewhere else? Tell us where.', icon: '📍' },
]

export default function LocationCheckInPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<LocationId | null>(null)
  const [otherText, setOtherText] = useState('')

  function handleSelect(id: LocationId) {
    setSelected(prev => (prev === id ? null : id))
    if (id !== 'other') setOtherText('')
  }

  const canContinue = selected !== null && (selected !== 'other' || otherText.trim().length > 0)

  function handleContinue() {
    if (!canContinue || !selected) return
    const location = selected === 'other' ? otherText.trim() : LOCATIONS.find(l => l.id === selected)!.label
    navigate('/zones', { state: { location } })
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
            <path d="M15 18l-6-6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700 }}>Check In</p>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>👋</div>
        <h1 style={{ color: 'var(--text)', fontSize: 21, fontWeight: 700, marginBottom: 8 }}>
          Hi! Where are you?
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
          Knowing your location helps us provide the right support for your environment.
        </p>
      </div>

      {/* Location cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {LOCATIONS.map(loc => {
          const isSelected = selected === loc.id
          return (
            <div key={loc.id}>
              <div
                onClick={() => handleSelect(loc.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 16, cursor: 'pointer',
                  border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                  backgroundColor: isSelected ? 'color-mix(in srgb, var(--green) 6%, transparent)' : 'var(--surface)',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  backgroundColor: 'color-mix(in srgb, var(--green) 14%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {loc.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{loc.label}</p>
                  <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>{loc.description}</p>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                  backgroundColor: isSelected ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && (
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              {loc.id === 'other' && isSelected && (
                <input
                  autoFocus
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  placeholder="Tell us where you are..."
                  style={{
                    width: '100%', marginTop: 10, padding: '13px 16px', borderRadius: 12, fontSize: 14,
                    backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Info pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px', borderRadius: 24,
        backgroundColor: 'color-mix(in srgb, var(--blue) 8%, transparent)',
      }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="1.5" />
          <path d="M12 16v-4M12 8h.01" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>Selecting a location tailors your sensory toolkit.</p>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        style={{
          width: '100%', padding: '15px', borderRadius: 14,
          fontWeight: 600, fontSize: 15,
          backgroundColor: 'var(--green)', color: '#fff',
          border: 'none',
          opacity: canContinue ? 1 : 0.35,
          cursor: canContinue ? 'pointer' : 'default',
          transition: 'opacity 0.2s',
        }}
      >
        Continue
      </button>
    </div>
  )
}
