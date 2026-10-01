import { useState } from 'react'
import { login } from './api/auth'
import { useToast } from './useToast'

function LoginForm({ onLogin, onBack, appName = 'Patient Management' }) {
  const { showToast } = useToast()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        {onBack && (
          <button className="login-back" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        <div className="brand-mark" aria-hidden="true">+</div>
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
      </section>
    </main>
  )
}

export default LoginForm
