function WelcomePage({ appName = 'Patient Management', onSignIn, onRegister }) {
  return (
    <div className="welcome-page">
      <header className="welcome-nav">
        <a className="brand" href="/" aria-label={`${appName} home`}>
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>{appName}</span>
        </a>
      </header>

      <main>
        <section className="welcome-hero" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <p className="eyebrow">PATIENT CARE PORTAL</p>
            <h1 id="welcome-title">{appName}</h1>
            <p className="welcome-tagline">Patient records and visit history, all in one place.</p>
            <div className="welcome-actions">
              <button className="button button-primary" type="button" onClick={onSignIn}>
                Sign in
              </button>
              <button className="button button-outline" type="button" onClick={onRegister}>
                Register
              </button>
            </div>
          </div>

          <div className="welcome-preview" aria-hidden="true">
            <div className="preview-topline">
              <span className="preview-indicator" />
              <span>CARE OVERVIEW</span>
              <span className="preview-date">TODAY</span>
            </div>
            <div className="preview-record">
              <span className="preview-avatar">P</span>
              <div className="preview-record-copy">
                <span className="preview-record-name" />
                <span className="preview-record-detail" />
              </div>
              <span className="preview-status">ACTIVE</span>
            </div>
            <div className="preview-metrics">
              <div className="preview-metric">
                <span>RECORDS</span>
                <strong>Patients</strong>
                <i className="metric-line metric-line-wide" />
              </div>
              <div className="preview-metric preview-metric-accent">
                <span>CARE LOG</span>
                <strong>Visits</strong>
                <i className="metric-line" />
              </div>
            </div>
            <div className="preview-footer">
              <span>Patient details</span>
              <span className="preview-arrow">↗</span>
            </div>
          </div>
        </section>

        <section className="welcome-features" aria-label="Features">
          <article className="feature-card">
            <span className="feature-index">01</span>
            <h2>Manage patient records</h2>
            <p>Keep essential patient information organized and easy to find.</p>
          </article>
          <article className="feature-card">
            <span className="feature-index">02</span>
            <h2>Track doctor visits</h2>
            <p>Record appointments, notes, and diagnoses in each patient history.</p>
          </article>
          <article className="feature-card">
            <span className="feature-index">03</span>
            <h2>Secure login</h2>
            <p>Access the care workspace through authenticated sign-in.</p>
          </article>
        </section>
      </main>

      <footer className="welcome-footer">
        <span>{appName}</span>
        <span>Patient care, thoughtfully organized.</span>
      </footer>
    </div>
  )
}

export default WelcomePage
