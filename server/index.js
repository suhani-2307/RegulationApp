import 'dotenv/config'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { query } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.startsWith('replace-with')) {
  console.error('JWT_SECRET is not set. Put a long random string in .env.')
  process.exit(1)
}

const app = express()
app.use(express.json())

// ---------- helpers ----------

const ZONES = ['green', 'yellow', 'red']

function signToken(account) {
  return jwt.sign({ id: account.id, role: account.role }, JWT_SECRET, { expiresIn: '30d' })
}

// Turns a DB row into the shape the frontend's types expect
function toZoneEntry(row) {
  if (!row || !row.zone) return null
  return {
    zone: row.zone,
    emotion: row.emotion,
    location: row.location ?? undefined,
    sessionId: row.session_id,
    time: row.created_at,
  }
}

// Builds the UserProfile / CaregiverProfile the frontend expects for the signed-in account
async function loadProfile(accountId) {
  const { rows } = await query('SELECT * FROM accounts WHERE id = $1', [accountId])
  const a = rows[0]
  if (!a) return null

  if (a.role === 'user') {
    const pair = await query(
      `SELECT c.username FROM pairings p JOIN accounts c ON c.id = p.caregiver_id WHERE p.user_id = $1`,
      [a.id],
    )
    return {
      role: 'user',
      user: {
        firstName: a.first_name,
        lastName: a.last_name,
        username: a.username,
        age: a.age,
        email: a.email,
        diagnosis: a.diagnosis,
        pairedCaregiverUsername: pair.rows[0]?.username,
      },
      caregiver: null,
    }
  }

  const clients = await query(
    `SELECT u.email FROM pairings p JOIN accounts u ON u.id = p.user_id
     WHERE p.caregiver_id = $1 ORDER BY p.paired_at`,
    [a.id],
  )
  return {
    role: 'caregiver',
    user: null,
    caregiver: {
      name: a.name,
      username: a.username,
      email: a.email,
      pairedUserEmails: clients.rows.map(r => r.email),
    },
  }
}

// Reads "Authorization: Bearer <token>"; optionally requires a specific role
function requireAuth(role) {
  return (req, res, next) => {
    const header = req.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Not signed in.' })
    try {
      req.account = jwt.verify(token, JWT_SECRET)
    } catch {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' })
    }
    if (role && req.account.role !== role) {
      return res.status(403).json({ error: `Only ${role}s can do that.` })
    }
    next()
  }
}

const clean = v => (typeof v === 'string' ? v.trim() : '')

// ---------- routes ----------

app.get('/api/health', async (_req, res) => {
  await query('SELECT 1')
  res.json({ ok: true })
})

// Sign up. Body: { role: 'user'|'caregiver', password, ...profile fields }
app.post('/api/signup', async (req, res) => {
  const b = req.body ?? {}
  const role = b.role
  const username = clean(b.username).replace(/^@/, '')
  const email = clean(b.email)
  const password = typeof b.password === 'string' ? b.password : ''

  if (role !== 'user' && role !== 'caregiver') return res.status(400).json({ error: 'Invalid role.' })
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required.' })
  }

  const taken = await query(
    `SELECT lower(email) = lower($1) AS email_taken FROM accounts
     WHERE lower(email) = lower($1) OR lower(username) = lower($2) LIMIT 1`,
    [email, username],
  )
  if (taken.rows[0]) {
    return res.status(409).json({
      error: taken.rows[0].email_taken ? 'An account with that email already exists.' : 'That username is already taken.',
    })
  }

  const hash = await bcrypt.hash(password, 10)
  const age = Number.isFinite(Number(b.age)) && b.age !== '' ? Number(b.age) : null

  const { rows } = await query(
    `INSERT INTO accounts (role, username, email, password_hash, first_name, last_name, name, age, diagnosis)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, role`,
    role === 'user'
      ? [role, username, email, hash, clean(b.firstName), clean(b.lastName), null, age, clean(b.diagnosis)]
      : [role, username, email, hash, null, null, clean(b.name), null, null],
  )

  res.status(201).json({ token: signToken(rows[0]), ...(await loadProfile(rows[0].id)) })
})

// Sign in with username or email. Body: { identifier, password }
app.post('/api/login', async (req, res) => {
  const id = clean(req.body?.identifier).replace(/^@/, '')
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  const { rows } = await query(
    'SELECT id, role, password_hash FROM accounts WHERE lower(email) = lower($1) OR lower(username) = lower($1)',
    [id],
  )
  const account = rows[0]
  if (!account) return res.status(404).json({ error: 'No account found with that username or email.' })
  if (!(await bcrypt.compare(password, account.password_hash))) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  res.json({ token: signToken(account), ...(await loadProfile(account.id)) })
})

// Who am I? Used to restore the session after a page refresh.
app.get('/api/me', requireAuth(), async (req, res) => {
  const profile = await loadProfile(req.account.id)
  if (!profile) return res.status(401).json({ error: 'Account no longer exists.' })
  res.json(profile)
})

// Caregiver links to a user by @username. Body: { username }
app.post('/api/pair', requireAuth('caregiver'), async (req, res) => {
  const username = clean(req.body?.username).toLowerCase().replace(/^@/, '')
  if (!username) return res.status(400).json({ error: 'Please enter a username.' })

  const { rows } = await query(
    `SELECT a.id, p.caregiver_id FROM accounts a LEFT JOIN pairings p ON p.user_id = a.id
     WHERE lower(a.username) = $1 AND a.role = 'user'`,
    [username],
  )
  const target = rows[0]
  if (!target) return res.status(404).json({ error: 'No user found with that username.' })
  if (target.caregiver_id === req.account.id) return res.status(409).json({ error: 'You are already paired with this user.' })
  if (target.caregiver_id) return res.status(409).json({ error: 'This user is already paired with a caregiver.' })

  // ON CONFLICT guards against two caregivers pairing at the same moment
  const inserted = await query(
    'INSERT INTO pairings (user_id, caregiver_id) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
    [target.id, req.account.id],
  )
  if (inserted.rowCount === 0) return res.status(409).json({ error: 'This user is already paired with a caregiver.' })

  res.json({ ok: true, ...(await loadProfile(req.account.id)) })
})

// User logs a check-in. Body: { zone, emotion, location?, sessionId, time? }
app.post('/api/zone-entries', requireAuth('user'), async (req, res) => {
  const b = req.body ?? {}
  if (!ZONES.includes(b.zone)) return res.status(400).json({ error: 'Invalid zone.' })
  if (!clean(b.sessionId)) return res.status(400).json({ error: 'sessionId is required.' })

  const time = b.time && !Number.isNaN(Date.parse(b.time)) ? new Date(b.time) : new Date()
  const { rows } = await query(
    `INSERT INTO zone_entries (user_id, zone, emotion, location, session_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.account.id, b.zone, b.emotion ?? null, b.location ?? null, clean(b.sessionId), time],
  )
  res.status(201).json(toZoneEntry(rows[0]))
})

// User's own check-ins, newest first
app.get('/api/zone-entries/mine', requireAuth('user'), async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM zone_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500',
    [req.account.id],
  )
  res.json(rows.map(toZoneEntry))
})

// Caregiver's paired users, each with their latest check-in
app.get('/api/clients', requireAuth('caregiver'), async (req, res) => {
  const { rows } = await query(
    `SELECT u.email, u.first_name, u.last_name, u.username,
            z.zone, z.emotion, z.location, z.session_id, z.created_at
     FROM pairings p
     JOIN accounts u ON u.id = p.user_id
     LEFT JOIN LATERAL (
       SELECT * FROM zone_entries WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
     ) z ON true
     WHERE p.caregiver_id = $1
     ORDER BY p.paired_at`,
    [req.account.id],
  )
  res.json(rows.map(r => ({
    email: r.email,
    firstName: r.first_name ?? '',
    lastName: r.last_name ?? '',
    username: r.username,
    lastEntry: toZoneEntry(r),
  })))
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// ---------- serve the built React app (after `npm run build` in the repo root) ----------

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  // Any other GET goes to index.html so React Router can handle it
  app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(path.join(distDir, 'index.html')) : next()))
}

// Errors (including rejected async handlers, which Express 5 forwards here)
app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.code === '23505') return res.status(409).json({ error: 'That username or email is already taken.' })
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

const port = Number(process.env.PORT) || 3001
app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
