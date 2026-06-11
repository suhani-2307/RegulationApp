import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { inputStyle, labelStyle, EyeIcon, BackButton, StrengthBar, ErrorBanner } from '../components/FormHelpers'
import ThemeToggle from '../components/ThemeToggle'

const DIAGNOSES = ['ADHD', 'Autism', 'Anxiety', 'Depression', 'PTSD', 'Other']

export default function UserSignupPage() {
  const navigate = useNavigate()
  const { registerUser } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [otherDiagnosis, setOtherDiagnosis] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const passwordsMatch = password === confirm
  const ageNum = parseInt(age, 10)
  const validAge = age !== '' && !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120
  const diagnosisValue = diagnosis === 'Other' ? otherDiagnosis.trim() : diagnosis
  const validUsername = username.trim().length >= 3 && !/\s/.test(username)
  const canSubmit = !!(firstName.trim() && lastName.trim() && validUsername && validAge && email.trim() && password.length >= 8 && passwordsMatch && diagnosisValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const result = registerUser(
      { firstName: firstName.trim(), lastName: lastName.trim(), username: username.trim().toLowerCase(), age: ageNum, email: email.trim(), diagnosis: diagnosisValue },
      password
    )
    if (result.ok) navigate('/dashboard')
    else setError(result.error ?? 'Something went wrong.')
  }

  const focusBlue = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = 'var(--blue)')
  const blurDefault = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = 'var(--border)')

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <BackButton onClick={() => navigate('/')} label="Individual Sign Up" />
        <ThemeToggle />
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Fill in your details to get started.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }} noValidate>
        {/* Name row */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle()} placeholder="Jane" value={firstName}
              onChange={e => setFirstName(e.target.value)} onFocus={focusBlue} onBlur={blurDefault} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle()} placeholder="Doe" value={lastName}
              onChange={e => setLastName(e.target.value)} onFocus={focusBlue} onBlur={blurDefault} />
          </div>
        </div>

        {/* Username */}
        <div>
          <label style={labelStyle}>Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--muted)', fontSize: 15, pointerEvents: 'none', userSelect: 'none',
            }}>@</span>
            <input
              style={{ ...inputStyle(!!(username && !validUsername)), paddingLeft: 28 }}
              placeholder="yourname"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              onFocus={focusBlue}
              onBlur={blurDefault}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          {username && !validUsername && (
            <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>Must be at least 3 characters, no spaces.</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label style={labelStyle}>Age</label>
          <input type="number" min={1} max={120} style={inputStyle()} placeholder="e.g. 12"
            value={age} onChange={e => setAge(e.target.value)} onFocus={focusBlue} onBlur={blurDefault} />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" style={inputStyle()} placeholder="jane@example.com"
            value={email} onChange={e => setEmail(e.target.value)} onFocus={focusBlue} onBlur={blurDefault} />
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} style={{ ...inputStyle(), paddingRight: 48 }}
              placeholder="Min. 8 characters" value={password}
              onChange={e => setPassword(e.target.value)} onFocus={focusBlue} onBlur={blurDefault} />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', lineHeight: 0 }}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <StrengthBar password={password} />
        </div>

        {/* Confirm password */}
        <div>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showConfirm ? 'text' : 'password'}
              style={{ ...inputStyle(), paddingRight: 48, borderColor: confirm && !passwordsMatch ? 'var(--red)' : 'var(--border)' }}
              placeholder="Re-enter password" value={confirm}
              onChange={e => setConfirm(e.target.value)} onFocus={focusBlue}
              onBlur={e => (e.currentTarget.style.borderColor = confirm && !passwordsMatch ? 'var(--red)' : 'var(--border)')} />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', lineHeight: 0 }}>
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {confirm && !passwordsMatch && (
            <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>Passwords do not match.</p>
          )}
        </div>

        {/* Primary diagnosis */}
        <div>
          <label style={labelStyle}>Primary Diagnosis</label>
          <div style={{ position: 'relative' }}>
            <select value={diagnosis}
              onChange={e => { setDiagnosis(e.target.value); setOtherDiagnosis('') }}
              style={{ ...inputStyle(), paddingRight: 40, cursor: 'pointer' }}
              onFocus={focusBlue} onBlur={blurDefault}>
              <option value="" disabled>Select a diagnosis</option>
              {DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {diagnosis === 'Other' && (
            <input style={{ ...inputStyle(), marginTop: 10 }} placeholder="Please describe your diagnosis"
              value={otherDiagnosis} onChange={e => setOtherDiagnosis(e.target.value)}
              autoFocus onFocus={focusBlue} onBlur={blurDefault} />
          )}
        </div>

        {error && <ErrorBanner message={error} />}

        <button type="submit" disabled={!canSubmit} style={{
          width: '100%', padding: '16px', borderRadius: 12, fontWeight: 600, fontSize: 15,
          backgroundColor: 'var(--blue)', color: '#fff', opacity: canSubmit ? 1 : 0.35,
          transition: 'opacity 0.2s', marginTop: 8, cursor: canSubmit ? 'pointer' : 'default',
        }}>
          Create Account
        </button>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/signin')}
            style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}
