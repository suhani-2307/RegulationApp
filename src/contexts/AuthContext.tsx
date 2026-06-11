import { createContext, useContext, useState, useRef, type ReactNode } from 'react'

export type Role = 'user' | 'caregiver' | null

export interface UserProfile {
  firstName: string
  lastName: string
  username: string
  age: number
  email: string
  diagnosis: string
  pairedCaregiverUsername?: string
}

export interface CaregiverProfile {
  name: string
  username: string
  email: string
  pairedUserEmails?: string[]
}

export type ZoneColor = 'green' | 'yellow' | 'red'

export interface ZoneEntry {
  zone: ZoneColor
  emotion: string | null
  time: Date
}

export interface ClientInfo {
  email: string
  firstName: string
  lastName: string
  username: string
  lastEntry: ZoneEntry | null
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
  pairByUsername: (username: string) => { ok: boolean; error?: string }
  logZoneEntry: (entry: ZoneEntry) => void
  getClients: () => ClientInfo[]
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ role: null, user: null, caregiver: null })
  const [userStore, setUserStore] = useState<Map<string, UserRecord>>(new Map())
  const [caregiverStore, setCaregiverStore] = useState<Map<string, CaregiverRecord>>(new Map())
  const [zoneStore, setZoneStore] = useState<Map<string, ZoneEntry[]>>(new Map())
  // username (lowercase) → email — useRef so reads are always live
  const userUsernameIndex = useRef<Map<string, string>>(new Map())

  function registerUser(profile: UserProfile, password: string) {
    const emailKey = profile.email.toLowerCase()
    const usernameKey = profile.username.toLowerCase()

    if (userStore.has(emailKey)) return { ok: false, error: 'An account with that email already exists.' }
    if (userUsernameIndex.current.has(usernameKey)) return { ok: false, error: 'That username is already taken.' }

    // Check username isn't already used by a caregiver
    for (const r of caregiverStore.values()) {
      if (r.profile.username.toLowerCase() === usernameKey) return { ok: false, error: 'That username is already taken.' }
    }

    setUserStore(prev => new Map(prev).set(emailKey, { profile, password }))
    userUsernameIndex.current.set(usernameKey, emailKey)
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
    // Also check against user usernames
    if (userUsernameIndex.current.has(usernameKey)) return { ok: false, error: 'That username is already taken.' }

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

  // Called by a caregiver to link to a user via their @username
  function pairByUsername(rawUsername: string) {
    if (!state.caregiver) return { ok: false, error: 'Not signed in as a caregiver.' }

    const username = rawUsername.trim().toLowerCase().replace(/^@/, '')
    if (!username) return { ok: false, error: 'Please enter a username.' }

    const userEmail = userUsernameIndex.current.get(username)
    if (!userEmail) return { ok: false, error: 'No user found with that username.' }

    const userRecord = userStore.get(userEmail)
    if (!userRecord) return { ok: false, error: 'User not found.' }
    if (userRecord.profile.pairedCaregiverUsername) {
      return { ok: false, error: 'This user is already paired with a caregiver.' }
    }

    const caregiverUsername = state.caregiver.username.toLowerCase()

    // Prevent a caregiver pairing with the same user twice
    const existingEmails = state.caregiver.pairedUserEmails ?? []
    if (existingEmails.includes(userEmail)) {
      return { ok: false, error: 'You are already paired with this user.' }
    }

    // Mark user as paired
    const updatedUser = { ...userRecord.profile, pairedCaregiverUsername: caregiverUsername }
    setUserStore(prev => {
      const m = new Map(prev)
      m.set(userEmail, { ...userRecord, profile: updatedUser })
      return m
    })

    // Add user to caregiver's client list
    const updatedCaregiver = { ...state.caregiver, pairedUserEmails: [...existingEmails, userEmail] }
    setCaregiverStore(prev => {
      const m = new Map(prev)
      const rec = m.get(caregiverUsername)
      if (rec) m.set(caregiverUsername, { ...rec, profile: updatedCaregiver })
      return m
    })
    setState(s => ({ ...s, caregiver: updatedCaregiver }))

    return { ok: true }
  }

  function logZoneEntry(entry: ZoneEntry) {
    if (!state.user) return
    const key = state.user.email.toLowerCase()
    setZoneStore(prev => {
      const m = new Map(prev)
      const existing = m.get(key) ?? []
      m.set(key, [entry, ...existing])
      return m
    })
  }

  function getClients(): ClientInfo[] {
    if (!state.caregiver) return []
    const emails = state.caregiver.pairedUserEmails ?? []
    return emails.map(email => {
      const key = email.toLowerCase()
      const record = userStore.get(key)
      const entries = zoneStore.get(key) ?? []
      return {
        email,
        firstName: record?.profile.firstName ?? '',
        lastName: record?.profile.lastName ?? '',
        username: record?.profile.username ?? '',
        lastEntry: entries[0] ?? null,
      }
    })
  }

  function logout() {
    setState({ role: null, user: null, caregiver: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, registerUser, registerCaregiver, login, pairByUsername, logZoneEntry, getClients, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
