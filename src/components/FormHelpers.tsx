import type { CSSProperties } from 'react'

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--muted)',
  marginBottom: 8,
}

export function inputStyle(hasError = false): CSSProperties {
  return {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'var(--surface)',
    borderRadius: 12,
    border: `1px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.15s',
  }
}

export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</span>
    </div>
  )
}

function passwordStrength(pw: string): { label: string; color: string; pct: string } {
  if (!pw) return { label: '', color: 'transparent', pct: '0%' }
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length
  if (score <= 1) return { label: 'Weak', color: 'var(--red)', pct: '33%' }
  if (score <= 2) return { label: 'Fair', color: 'var(--yellow)', pct: '66%' }
  return { label: 'Strong', color: 'var(--green)', pct: '100%' }
}

export function StrengthBar({ password }: { password: string }) {
  const { label, color, pct } = passwordStrength(password)
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, borderRadius: 9999, backgroundColor: 'var(--border)' }}>
        <div style={{ height: 4, borderRadius: 9999, width: pct, backgroundColor: color, transition: 'width 0.3s, background-color 0.3s' }} />
      </div>
      <p style={{ fontSize: 11, marginTop: 4, color }}>{label}</p>
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-bd)' }}>
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" stroke="var(--red)" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="12" y2="13" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="0.75" fill="var(--red)" />
      </svg>
      <p style={{ color: 'var(--red)', fontSize: 13 }}>{message}</p>
    </div>
  )
}
