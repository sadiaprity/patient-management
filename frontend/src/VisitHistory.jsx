import { useEffect, useState } from 'react'
import { getPatientVisits } from './api/patients'
import { useToast } from './useToast'

function VisitHistory({ patient, onClose, onRecordVisit }) {
  const { showToast } = useToast()
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    let active = true

    getPatientVisits(patient.id)
      .then((result) => {
        if (active) setVisits(result)
      })
      .catch((error) => {
        if (active) {
          const message = error.response?.data?.detail || 'Could not load visit history.'
          setErrorMessage(message)
          showToast(message, 'error')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [patient.id, retryVersion, showToast])

  const handleRetry = () => {
    setLoading(true)
    setErrorMessage('')
    setRetryVersion((version) => version + 1)
  }

  const sortedVisits = [...visits].sort((first, second) => {
    const dateOrder = String(second.visit_date).localeCompare(String(first.visit_date))
    return dateOrder || Number(second.id) - Number(first.id)
  })
  const patientName = [patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Patient'
  const totalVisits = patient.total_visits ?? visits.length

  return (
    <div className="modal-backdrop">
      <section
        className="patient-modal history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-history-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">VISIT HISTORY</p>
            <h2 id="visit-history-title">{patientName}</h2>
            <p className="history-total">{totalVisits} {totalVisits === 1 ? 'visit' : 'visits'}</p>
          </div>
          <button className="modal-close" type="button" aria-label="Close visit history" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="history-content">
          {loading ? (
            <p className="state-message" role="status">Loading visit history...</p>
          ) : errorMessage ? (
            <div className="history-error" role="alert">
              <span>{errorMessage}</span>
              <button className="button button-quiet retry-button" type="button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          ) : sortedVisits.length === 0 ? (
            <div className="empty-state">
              <p>No visits recorded yet</p>
              <button className="button button-primary" type="button" onClick={onRecordVisit}>
                Record Visit
              </button>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="history-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Doctor</th>
                    <th scope="col">Clinical note</th>
                    <th scope="col">Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td className="history-date">{visit.visit_date}</td>
                      <td>{visit.doctor_name}</td>
                      <td className="history-note">{visit.clinical_note || '—'}</td>
                      <td className="history-note">{visit.diagnosis || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default VisitHistory
