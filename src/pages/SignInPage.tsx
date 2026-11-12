import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { inputStyle, labelStyle, EyeIcon, BackButton, ErrorBanner } from '../components/FormHelpers'
import ThemeToggle from '../components/ThemeToggle'

export default function SignInPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = identifier.trim().length > 0 && password.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const result = await login(identifier.trim(), password)
    if (result.ok) navigate('/dashboard')
    else setError(result.error ?? 'Something went wrong.')
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <BackButton onClick={() => navigate('/')} label="Sign In" />
        <ThemeToggle />
      </div>

      <div style={{ marginBottom: 40 }}>
        <p style={{ color: 'var(--blue)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
          Zones of Regulation
        </p>
        <h1 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to your account to continue.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }} noValidate>
        <div>
          <label style={labelStyle}>Username or Email</label>
          <input style={inputStyle(!!error)} placeholder="Enter username or email"
            value={identifier} autoFocus autoComplete="username"
            onChange={e => { setIdentifier(e.target.value); setError('') }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border)')} />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'}
              style={{ ...inputStyle(!!error), paddingRight: 48 }}
              placeholder="Your password" value={password} autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); setError('') }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
              onBlur={e => (e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border)')} />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', lineHeight: 0 }}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <button type="submit" disabled={!canSubmit} style={{
          width: '100%', padding: '16px', borderRadius: 12, fontWeight: 600, fontSize: 15,
          backgroundColor: 'var(--blue)', color: '#fff', opacity: canSubmit ? 1 : 0.35,
          transition: 'opacity 0.2s', marginTop: 8, cursor: canSubmit ? 'pointer' : 'default',
        }}>
          Sign In
        </button>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/')}
            style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Sign up
          </button>
        </p>
      </form>
    </div>
  )
}
