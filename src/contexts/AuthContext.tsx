import { createContext, useContext, useState, useRef, type ReactNode } from 'react'

export type Role = 'user' | 'caregiver' | null

export interface UserProfile {
  firstName: string
  lastName: string
  age: number
  email: string
  diagnosis: string
  pairingCode?: string
  pairedCaregiverUsername?: string
}

export interface CaregiverProfile {
  name: string
  username: string
  email: string
  pairedUserEmail?: string
}

interface UserRecord {
  profile: UserProfile
  password: string
}

interface CaregiverRecord {
  profile: CaregiverProfile
  password: string
}

interface AuthState {
  role: Role
  user: UserProfile | null
  caregiver: CaregiverProfile | null
}

interface AuthContextValue extends AuthState {
  registerUser: (profile: UserProfile, password: string) => { ok: boolean; error?: string }
  registerCaregiver: (profile: CaregiverProfile, password: string) => { ok: boolean; error?: string }
  login: (identifier: string, password: string) => { ok: boolean; role?: Role; error?: string }
  generatePairingCode: () => string
  submitPairingCode: (code: string) => { ok: boolean; caregiverName?: string; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function makeCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000).toString()
  return `${n.slice(0, 3)}-${n.slice(3)}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ role: null, user: null, caregiver: null })
  const [userStore, setUserStore] = useState<Map<string, UserRecord>>(new Map())
  const [caregiverStore, setCaregiverStore] = useState<Map<string, CaregiverRecord>>(new Map())
  // code → user email — useRef so reads are always live, no stale-closure issues
  const codeIndex = useRef<Map<string, string>>(new Map())

  function registerUser(profile: UserProfile, password: string) {
    const key = profile.email.toLowerCase()
    if (userStore.has(key)) return { ok: false, error: 'An account with that email already exists.' }
    setUserStore(prev => new Map(prev).set(key, { profile, password }))
    setState({ role: 'user', user: profile, caregiver: null })
    return { ok: true }
  }

  function registerCaregiver(profile: CaregiverProfile, password: string) {
    const emailKey = profile.email.toLowerCase()
    const usernameKey = profile.username.toLowerCase()
    for (const r of caregiverStore.values()) {
      if (r.profile.email.toLowerCase() === emailKey) return { ok: false, error: 'An account with that email already exists.' }
      if (r.profile.username.toLowerCase() === usernameKey) return { ok: false, error: 'That username is already taken.' }
    }
    setCaregiverStore(prev => new Map(prev).set(usernameKey, { profile, password }))
    setState({ role: 'caregiver', user: null, caregiver: profile })
    return { ok: true }
  }

  function login(identifier: string, password: string) {
    const id = identifier.trim().toLowerCase()

    const userRecord = userStore.get(id)
    if (userRecord) {
      if (userRecord.password !== password) return { ok: false, error: 'Incorrect password.' }
      setState({ role: 'user', user: userRecord.profile, caregiver: null })
      return { ok: true, role: 'user' as Role }
    }

    for (const [, r] of caregiverStore) {
      if (r.profile.username.toLowerCase() === id || r.profile.email.toLowerCase() === id) {
        if (r.password !== password) return { ok: false, error: 'Incorrect password.' }
        setState({ role: 'caregiver', user: null, caregiver: r.profile })
        return { ok: true, role: 'caregiver' as Role }
      }
    }

    return { ok: false, error: 'No account found with that username or email.' }
  }

  function generatePairingCode() {
    if (!state.user) return ''
    const code = makeCode()
    const emailKey = state.user.email.toLowerCase()

    // Remove old code if any
    if (state.user.pairingCode) {
      codeIndex.current.delete(state.user.pairingCode)
    }

    const updatedProfile = { ...state.user, pairingCode: code }
    setUserStore(prev => {
      const m = new Map(prev)
      const rec = m.get(emailKey)
      if (rec) m.set(emailKey, { ...rec, profile: updatedProfile })
      return m
    })
    codeIndex.current.set(code, emailKey)
    setState(s => ({ ...s, user: updatedProfile }))
    return code
  }

  // Called by caregiver to link to a user via their pairing code
  function submitPairingCode(code: string) {
    if (!state.caregiver) return { ok: false, error: 'Not signed in as a caregiver.' }

    const userEmail = codeIndex.current.get(code)
    if (!userEmail) return { ok: false, error: 'Invalid or expired pairing code.' }

    const userRecord = userStore.get(userEmail)
    if (!userRecord) return { ok: false, error: 'User not found.' }
    if (userRecord.profile.pairedCaregiverUsername) {
      return { ok: false, error: 'This user is already paired with a caregiver.' }
    }

    const caregiverUsername = state.caregiver.username.toLowerCase()

    // Mark user as paired
    const updatedUser = { ...userRecord.profile, pairedCaregiverUsername: caregiverUsername }
    setUserStore(prev => {
      const m = new Map(prev)
      m.set(userEmail, { ...userRecord, profile: updatedUser })
      return m
    })

    // Mark caregiver as paired
    const updatedCaregiver = { ...state.caregiver, pairedUserEmail: userEmail }
    setCaregiverStore(prev => {
      const m = new Map(prev)
      const rec = m.get(caregiverUsername)
      if (rec) m.set(caregiverUsername, { ...rec, profile: updatedCaregiver })
      return m
    })
    setState(s => ({ ...s, caregiver: updatedCaregiver }))

    // Invalidate the code
    codeIndex.current.delete(code)

    return { ok: true, caregiverName: state.caregiver.name }
  }

  function logout() {
    setState({ role: null, user: null, caregiver: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, registerUser, registerCaregiver, login, generatePairingCode, submitPairingCode, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
