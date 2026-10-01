import { useCallback, useEffect, useRef, useState } from 'react'
import LoginForm from './LoginForm'
import PatientForm from './PatientForm'
import PatientList from './PatientList'
import WelcomePage from './WelcomePage'
import { getPatient } from './api/patients'
import { useToast } from './useToast'
import './App.css'

const APP_NAME = 'Patient Management'

const getUserIdFromToken = (token) => {
  const encodedPayload = token.split('.')[1]
  if (!encodedPayload) throw new Error('Invalid access token')

  const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
  const payload = JSON.parse(atob(base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=')))
  if (payload.user_id === undefined || payload.user_id === null) {
    throw new Error('Access token does not contain a user ID')
  }

  return payload.user_id
}

const fetchCurrentUser = (token) => getPatient(getUserIdFromToken(token))

function App() {
  const { showToast } = useToast()
  const [view, setView] = useState(
    () => (localStorage.getItem('accessToken') ? 'app' : 'welcome'),
  )
  const [patientForm, setPatientForm] = useState({ open: false, initialData: null })
  const [isRegistering, setIsRegistering] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const refreshPatients = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    let cancelled = false

    if (token) {
      fetchCurrentUser(token)
        .then((user) => {
          if (!cancelled) setCurrentUser(user)
        })
        .catch(() => {
          if (!cancelled) setCurrentUser(null)
        })
    }

    return () => {
      cancelled = true
    }
  }, [])

  const registerRefresh = useCallback((refresh) => {
    refreshPatients.current = refresh
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setCurrentUser(null)
    setView('welcome')
  }

  const handleLogin = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const user = await fetchCurrentUser(token)
      setCurrentUser(user)
    } catch {
      setCurrentUser(null)
      showToast('Signed in, but your account details could not be loaded.', 'error')
    }
    setShowLogin(false)
    setView('app')
  }

  const handleSaveSuccess = () => {
    const wasEdit = Boolean(patientForm.initialData)
    setPatientForm({ open: false, initialData: null })
    refreshPatients.current?.()
    showToast(wasEdit ? 'Patient updated.' : 'Patient added.', 'success')
  }

  const handleRegistrationSuccess = () => {
    setIsRegistering(false)
    setShowLogin(true)
    showToast('Registration successful. Please sign in.', 'success')
  }

  const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ')
  const initials = [currentUser?.first_name, currentUser?.last_name]
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .toUpperCase()

  if (view === 'welcome') {
    return (
      <>
        <WelcomePage
          appName={APP_NAME}
          onSignIn={() => setShowLogin(true)}
          onRegister={() => setIsRegistering(true)}
        />
        {isRegistering && (
          <PatientForm
            initialData={null}
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setIsRegistering(false)}
          />
        )}
        {showLogin && (
          <LoginForm
            appName={APP_NAME}
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
            onRegister={() => {
              setShowLogin(false)
              setIsRegistering(true)
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label={`${APP_NAME} home`}>
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>{APP_NAME}</span>
        </a>
        <div className="topbar-actions">
          {currentUser && (
            <div className="user-chip">
              <span className="user-avatar" aria-hidden="true">{initials || '?'}</span>
              <span className="user-details">
                <strong>{fullName || currentUser.mobile}</strong>
                <small>{currentUser.mobile}</small>
              </span>
            </div>
          )}
          <button className="button button-quiet" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <PatientList
        currentUser={currentUser}
        onAddPatient={() => setPatientForm({ open: true, initialData: null })}
        onEditPatient={(patient) => setPatientForm({ open: true, initialData: patient })}
        onRefreshReady={registerRefresh}
      />
      {patientForm.open && (
        <PatientForm
          initialData={patientForm.initialData}
          onSuccess={handleSaveSuccess}
          onCancel={() => setPatientForm({ open: false, initialData: null })}
        />
      )}
    </div>
  )
}

export default App
