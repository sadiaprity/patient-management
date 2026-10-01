import { useCallback, useRef, useState } from 'react'
import LoginForm from './LoginForm'
import PatientForm from './PatientForm'
import PatientList from './PatientList'
import WelcomePage from './WelcomePage'
import { useToast } from './useToast'
import './App.css'

const APP_NAME = 'Patient Management'

function App() {
  const { showToast } = useToast()
  const [view, setView] = useState(
    () => (localStorage.getItem('accessToken') ? 'app' : 'welcome'),
  )
  const [patientForm, setPatientForm] = useState({ open: false, initialData: null })
  const [isRegistering, setIsRegistering] = useState(false)
  const refreshPatients = useRef(null)

  const registerRefresh = useCallback((refresh) => {
    refreshPatients.current = refresh
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setView('welcome')
  }

  const handleSaveSuccess = () => {
    const wasEdit = Boolean(patientForm.initialData)
    setPatientForm({ open: false, initialData: null })
    refreshPatients.current?.()
    showToast(wasEdit ? 'Patient updated.' : 'Patient added.', 'success')
  }

  const handleRegistrationSuccess = () => {
    setIsRegistering(false)
    setView('login')
    showToast('Registration successful. Please sign in.', 'success')
  }

  if (view === 'welcome') {
    return (
      <>
        <WelcomePage
          appName={APP_NAME}
          onSignIn={() => setView('login')}
          onRegister={() => setIsRegistering(true)}
        />
        {isRegistering && (
          <PatientForm
            initialData={null}
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setIsRegistering(false)}
          />
        )}
      </>
    )
  }

  if (view === 'login') {
    return (
      <LoginForm
        appName={APP_NAME}
        onLogin={() => setView('app')}
        onBack={() => setView('welcome')}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label={`${APP_NAME} home`}>
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>{APP_NAME}</span>
        </a>
        <button className="button button-quiet" type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <PatientList
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
