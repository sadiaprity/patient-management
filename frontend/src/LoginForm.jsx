import { useEffect, useState } from 'react'
import { login } from './api/auth'
import { useToast } from './useToast'

function LoginForm({ onLogin, onClose, onRegister, appName = 'Patient Management' }) {
  const { showToast } = useToast()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await login(mobile, password)
      onLogin()
    } catch (error) {
      const detail = error.response?.data?.detail
      const message = detail || 'Unable to sign in. Please check your details and try again.'
      setErrorMessage(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <section
        className="patient-modal login-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Close sign in"
          onClick={onClose}
        >
          ×
        </button>
        <p className="eyebrow">PATIENT CARE PORTAL</p>
        <h1 id="login-title">{appName}</h1>
        <p className="login-intro">Sign in to manage patient records.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="mobile">Mobile number</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            autoComplete="username"
            inputMode="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {errorMessage && (
            <p className="form-error" role="alert">{errorMessage}</p>
          )}

          <button className="button button-primary login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="login-register">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onRegister}>Create an account</button>
        </p>
      </section>
    </div>
  )
}

export default LoginForm
