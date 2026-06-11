import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const EXPIRY_SECONDS = 300 // 5 minutes

export default function PairingPage() {
  const navigate = useNavigate()
  const { user, generatePairingCode } = useAuth()

  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [copied, setCopied] = useState(false)
  const generated = useRef(false)

  function refresh() {
    const newCode = generatePairingCode()
    setCode(newCode)
    setSecondsLeft(EXPIRY_SECONDS)
    setCopied(false)
  }

  // Generate exactly once on mount
  useEffect(() => {
    if (!generated.current) {
      generated.current = true
      refresh()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const expired = secondsLeft <= 0
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeLabel = expired ? 'Expired' : `${mins}:${secs.toString().padStart(2, '0')}`
  const timerColor = secondsLeft <= 30 ? 'var(--red)' : secondsLeft <= 60 ? 'var(--yellow)' : 'var(--muted)'

  const progress = secondsLeft / EXPIRY_SECONDS
  const circumference = 2 * Math.PI * 26
  const dashOffset = circumference * (1 - progress)

  function copyCode() {
    navigator.clipboard.writeText(code.replace('-', '')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user) return null

  const isPaired = !!user.pairedCaregiverUsername

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--muted)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <ThemeToggle />
      </div>

      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--blue)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
          Pairing
        </p>
        <h1 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Connect with a caregiver
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          Share this code with your caregiver. They'll enter it to link their account to yours.
        </p>
      </div>

      {isPaired ? (
        <PairedState caregiverUsername={user.pairedCaregiverUsername!} onNavigate={() => navigate('/dashboard')} />
      ) : (
        <>
          {/* Code card */}
          <div style={{
            backgroundColor: 'var(--surface)', borderRadius: 20,
            border: `1px solid ${expired ? 'var(--red)' : 'var(--border)'}`,
            padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
            marginBottom: 24, transition: 'border-color 0.3s',
          }}>
            {/* Timer ring */}
            <div style={{ position: 'relative', width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="68" height="68" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="34" cy="34" r="26" fill="none" stroke="var(--border)" strokeWidth="4" />
                <circle
                  cx="34" cy="34" r="26" fill="none"
                  stroke={expired ? 'var(--red)' : secondsLeft <= 60 ? 'var(--yellow)' : 'var(--blue)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                />
              </svg>
              <span style={{ color: timerColor, fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {timeLabel}
              </span>
            </div>

            {/* The code */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your pairing code
              </p>
              <div style={{
                fontSize: 42, fontWeight: 700, letterSpacing: '0.25em',
                color: expired ? 'var(--muted)' : 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
                filter: expired ? 'blur(6px)' : 'none',
                transition: 'color 0.3s, filter 0.3s',
                userSelect: 'all',
              }}>
                {code}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button
                onClick={copyCode}
                disabled={expired}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                  backgroundColor: copied ? 'color-mix(in srgb, var(--green) 12%, transparent)' : 'var(--surface2)',
                  border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`,
                  color: copied ? 'var(--green)' : 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: expired ? 'not-allowed' : 'pointer',
                  opacity: expired ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {copied ? (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Copy code
                  </>
                )}
              </button>

              <button
                onClick={refresh}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                  backgroundColor: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer', transition: 'opacity 0.2s',
                }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {expired ? 'Generate new' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', padding: 20 }}>
            <p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>How it works</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { n: '1', text: 'Share the 6-digit code above with your caregiver.' },
                { n: '2', text: 'Your caregiver signs in and enters the code on their dashboard.' },
                { n: '3', text: 'You\'re linked! Your caregiver can now support you.' },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: 'color-mix(in srgb, var(--blue) 15%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--blue)',
                  }}>{n}</div>
                  <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PairedState({ caregiverUsername, onNavigate }: { caregiverUsername: string; onNavigate: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        backgroundColor: 'color-mix(in srgb, var(--green) 15%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Already paired!</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          You're connected with caregiver <strong style={{ color: 'var(--text)' }}>@{caregiverUsername}</strong>.
        </p>
      </div>
      <button
        onClick={onNavigate}
        style={{
          padding: '13px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          backgroundColor: 'var(--blue)', color: '#fff', cursor: 'pointer',
        }}
      >
        Go to dashboard
      </button>
    </div>
  )
}
