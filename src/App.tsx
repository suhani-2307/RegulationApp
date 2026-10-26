import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import PersonaSelectionPage from './pages/PersonaSelectionPage'
import UserSignupPage from './pages/UserSignupPage'
import CaregiverSignupPage from './pages/CaregiverSignupPage'
import SignInPage from './pages/SignInPage'
import DashboardPage from './pages/DashboardPage'
import PairingPage from './pages/PairingPage'
import LocationCheckInPage from './pages/LocationCheckInPage'
import ZonesOfRegulationPage from './pages/ZonesOfRegulationPage'
import CalmingRoutinePage from './pages/CalmingRoutinePage'
import YellowRoutinePage from './pages/YellowRoutinePage'
import SocialStoryPage from './pages/SocialStoryPage'
import GreenRoutinePage from './pages/GreenRoutinePage'
import ClientsPage from './pages/ClientsPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  if (!role) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', position: 'relative' }}>
        <Routes>
          <Route path="/" element={<PersonaSelectionPage />} />
          <Route path="/signup" element={<UserSignupPage />} />
          <Route path="/caregiver-signup" element={<CaregiverSignupPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pairing"
            element={
              <ProtectedRoute>
                <PairingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-in"
            element={
              <ProtectedRoute>
                <LocationCheckInPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/zones"
            element={
              <ProtectedRoute>
                <ZonesOfRegulationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calming-routine"
            element={
              <ProtectedRoute>
                <CalmingRoutinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/yellow-routine"
            element={
              <ProtectedRoute>
                <YellowRoutinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social-story"
            element={
              <ProtectedRoute>
                <SocialStoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/green-routine"
            element={
              <ProtectedRoute>
                <GreenRoutinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
