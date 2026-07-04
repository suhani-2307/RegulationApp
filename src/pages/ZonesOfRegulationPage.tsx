import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

type Zone = 'green' | 'yellow' | 'red'

const ZONES = [
  {
    id: 'green' as Zone,
    color: 'var(--green)',
    label: 'Green Zone',
    tagline: 'Calm & ready',
    description: 'Feeling calm, focused, happy, or content.',
    emotions: ['Happy', 'Calm', 'Focused', 'Excited'],
    icon: '😊',
  },
  {
    id: 'yellow' as Zone,
    color: 'var(--yellow)',
    label: 'Yellow Zone',
    tagline: 'A little off',
    description: 'Feeling worried, frustrated, silly, or nervous.',
    emotions: ['Worried', 'Frustrated', 'Silly', 'Nervous'],
    icon: '😟',
  },
  {
    id: 'red' as Zone,
    color: 'var(--red)',
    label: 'Red Zone',
    tagline: 'Need support',
    description: 'Feeling very angry, terrified, or out of control.',
    emotions: ['Angry', 'Terrified', 'Overwhelmed', 'Out of control'],
    icon: '😡',
  },
]

interface LogEntry {
  zone: Zone
  emotion: string | null
  time: Date
  location?: string
}

export default function ZonesOfRegulationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const checkInLocation = (location.state as { location?: string } | null)?.location ?? null
  const { logZoneEntry } = useAuth()
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [justLogged, setJustLogged] = useState(false)

  function handleZoneTap(id: Zone) {
    if (selectedZone === id) {
      setSelectedZone(null)
      setSelectedEmotion(null)
    } else {
      setSelectedZone(id)
      setSelectedEmotion(null)
      setJustLogged(false)
    }
  }

  function handleCheckIn() {
    if (!selectedZone) return
    if (selectedZone === 'red') {
      navigate('/calming-routine', { state: { emotion: selectedEmotion, location: checkInLocation } })
      return
    }
    if (selectedZone === 'yellow') {
      navigate('/yellow-routine', { state: { emotion: selectedEmotion, location: checkInLocation } })
      return
    }
    if (selectedZone === 'green') {
      navigate('/green-routine', { state: { emotion: selectedEmotion, location: checkInLocation } })
      return
    }
    const entry = { zone: selectedZone, emotion: selectedEmotion, time: new Date(), location: checkInLocation ?? undefined }
    logZoneEntry(entry)
    setEntries(prev => [entry, ...prev])
    setJustLogged(true)
    setSelectedZone(null)
    setSelectedEmotion(null)
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg)',
      minHeight: '100vh',
      padding: '40px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
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
        <ThemeToggle />
      </div>

      {/* Header */}
      <div style={{ marginTop: 4 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Zones of Regulation
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Tap a zone to log how you're feeling right now.
        </p>
        {checkInLocation && (
          <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 6 }}>
            📍 Checked in at <strong style={{ color: 'var(--text)' }}>{checkInLocation}</strong>
          </p>
        )}
      </div>

      {/* Success flash */}
      {justLogged && (
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
          <p style={{ color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>Check-in logged!</p>
        </div>
      )}

      {/* Zone cards */}
      {ZONES.map(zone => {
        const isSelected = selectedZone === zone.id
        return (
          <div
            key={zone.id}
            style={{
              borderRadius: 16,
              border: `2px solid ${isSelected
                ? zone.color
                : `color-mix(in srgb, ${zone.color} 20%, transparent)`}`,
              backgroundColor: `color-mix(in srgb, ${zone.color} ${isSelected ? 8 : 4}%, transparent)`,
              overflow: 'hidden',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            {/* Zone header row */}
            <div
              onClick={() => handleZoneTap(zone.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '18px 20px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                backgroundColor: `color-mix(in srgb, ${zone.color} 18%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                {zone.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: zone.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  {zone.label}
                </p>
                <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                  {zone.tagline}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {zone.description}
                </p>
              </div>

              <svg
                width="16" height="16" fill="none" viewBox="0 0 24 24"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                <path d="M9 18l6-6-6-6" stroke={zone.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Expanded section */}
            {isSelected && (
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ height: 1, backgroundColor: `color-mix(in srgb, ${zone.color} 20%, transparent)` }} />

                {/* Emotion chips */}
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    How specifically?
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {zone.emotions.map(emotion => {
                      const isChosen = selectedEmotion === emotion
                      return (
                        <button
                          key={emotion}
                          onClick={() => setSelectedEmotion(prev => prev === emotion ? null : emotion)}
                          style={{
                            padding: '7px 14px', borderRadius: 20,
                            fontSize: 13, fontWeight: 500,
                            border: `1px solid ${isChosen
                              ? zone.color
                              : `color-mix(in srgb, ${zone.color} 30%, transparent)`}`,
                            backgroundColor: isChosen
                              ? `color-mix(in srgb, ${zone.color} 18%, transparent)`
                              : 'transparent',
                            color: isChosen ? zone.color : 'var(--text)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {emotion}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Check-in button */}
                <button
                  onClick={handleCheckIn}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12,
                    fontWeight: 600, fontSize: 14,
                    backgroundColor: zone.color,
                    color: zone.id === 'yellow' ? '#1a1a00' : '#fff',
                    cursor: 'pointer', transition: 'opacity 0.15s',
                    border: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {zone.id === 'red'
                    ? 'Start Calming Routine'
                    : zone.id === 'yellow'
                    ? 'Start Yellow Routine'
                    : zone.id === 'green'
                    ? 'View Green Zone Tools'
                    : selectedEmotion ? `Log: ${selectedEmotion}` : 'Log this zone'}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Recent entries */}
      {entries.length > 0 && (
        <div style={{
          borderRadius: 16,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: 20,
        }}>
          <p style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Today's check-ins
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.slice(0, 5).map((entry, i) => {
              const zone = ZONES.find(z => z.id === entry.zone)!
              const time = entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: zone.color, flexShrink: 0,
                  }} />
                  <span style={{ color: 'var(--text)', fontSize: 13, flex: 1 }}>
                    {zone.label}{entry.emotion ? ` · ${entry.emotion}` : ''}{entry.location ? ` · ${entry.location}` : ''}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{time}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
