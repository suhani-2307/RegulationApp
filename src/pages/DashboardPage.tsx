import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { ErrorBanner } from '../components/FormHelpers'

export default function DashboardPage() {
  const { role, user, caregiver, submitPairingCode, logout } = useAuth()
  const navigate = useNavigate()

  const isUser = role === 'user'
  const displayName = isUser ? user?.firstName : caregiver?.name
  const accentColor = isUser ? 'var(--blue)' : 'var(--green)'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '40px 24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>
            {isUser ? 'Individual' : 'Caregiver'}
          </p>
          <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700 }}>
            Hello, {displayName} 👋
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div style={{
        padding: 20, borderRadius: 16,
        border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accentColor} 6%, transparent)`,
      }}>
        <p style={{ color: accentColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Your Profile
        </p>
        {isUser && user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Name" value={`${user.firstName} ${user.lastName}`} />
            <Row label="Age" value={String(user.age)} />
            <Row label="Email" value={user.email} />
            <Row label="Diagnosis" value={user.diagnosis} />
          </div>
        ) : caregiver ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Name" value={caregiver.name} />
            <Row label="Username" value={caregiver.username} />
            <Row label="Email" value={caregiver.email} />
          </div>
        ) : null}
      </div>

      {/* Zones of regulation */}
      {isUser && (
        <button
          onClick={() => navigate('/zones')}
          style={{
            width: '100%', padding: 20, borderRadius: 14, textAlign: 'left',
            backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'border-color 0.15s',
            display: 'flex', alignItems: 'center', gap: 16,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'color-mix(in srgb, var(--blue) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
            🟢
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Zones of Regulation</p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Log how you're feeling right now</p>
          </div>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Pairing section */}
      {isUser && user ? (
        <UserPairingCard
          pairedCaregiverUsername={user.pairedCaregiverUsername}
          onGoToPairing={() => navigate('/pairing')}
        />
      ) : caregiver ? (
        <CaregiverPairingCard
          pairedUserEmail={caregiver.pairedUserEmail}
          submitPairingCode={submitPairingCode}
        />
      ) : null}
    </div>
  )
}

function UserPairingCard({ pairedCaregiverUsername, onGoToPairing }: {
  pairedCaregiverUsername?: string
  onGoToPairing: () => void
}) {
  if (pairedCaregiverUsername) {
    return (
      <div style={{ padding: 20, borderRadius: 14, backgroundColor: 'var(--surface)', border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--green) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>Paired with a caregiver</p>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Connected to <strong style={{ color: 'var(--text)' }}>@{pairedCaregiverUsername}</strong>
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={onGoToPairing}
      style={{
        width: '100%', padding: 20, borderRadius: 14, textAlign: 'left',
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        cursor: 'pointer', transition: 'border-color 0.15s',
        display: 'flex', alignItems: 'center', gap: 16,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'color-mix(in srgb, var(--blue) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Pair with a caregiver</p>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Generate a code to connect your account</p>
      </div>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function CaregiverPairingCard({ pairedUserEmail, submitPairingCode }: {
  pairedUserEmail?: string
  submitPairingCode: (code: string) => { ok: boolean; caregiverName?: string; error?: string }
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function formatCode(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = submitPairingCode(code)
    if (result.ok) {
      setSuccess(`Paired successfully! You're now connected to your client.`)
      setCode('')
    } else {
      setError(result.error ?? 'Something went wrong.')
    }
  }

  const digitCount = code.replace(/\D/g, '').length

  if (pairedUserEmail) {
    return (
      <div style={{ padding: 20, borderRadius: 14, backgroundColor: 'var(--surface)', border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--green) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>Paired with a client</p>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Client account: <strong style={{ color: 'var(--text)' }}>{pairedUserEmail}</strong></p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, borderRadius: 14, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Connect to a client</p>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
        Ask your client for their 6-digit pairing code and enter it below.
      </p>

      {success ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, backgroundColor: 'color-mix(in srgb, var(--green) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="var(--green)" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ color: 'var(--green)', fontSize: 13 }}>{success}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={code}
            onChange={e => { setCode(formatCode(e.target.value)); setError('') }}
            placeholder="000-000"
            maxLength={7}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 22,
              fontWeight: 700, letterSpacing: '0.3em', textAlign: 'center',
              backgroundColor: 'var(--bg)', border: `1px solid ${digitCount === 6 ? 'var(--green)' : 'var(--border)'}`,
              color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.currentTarget.style.borderColor = digitCount === 6 ? 'var(--green)' : 'var(--border)')}
          />
          {error && <ErrorBanner message={error} />}
          <button
            type="submit"
            disabled={digitCount !== 6}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, fontWeight: 600, fontSize: 14,
              backgroundColor: 'var(--green)', color: '#fff',
              opacity: digitCount === 6 ? 1 : 0.35,
              cursor: digitCount === 6 ? 'pointer' : 'default',
              transition: 'opacity 0.2s',
            }}
          >
            Link account
          </button>
        </form>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</span>
      <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  )
}
