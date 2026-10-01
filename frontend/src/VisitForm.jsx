import { useState } from 'react'
import { createVisit } from './api/patients'
import { useToast } from './useToast'

const getLocalDate = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

const getErrorText = (value) => {
  if (Array.isArray(value)) return value.join(' ')
  if (typeof value === 'string') return value
  return ''
}

function VisitForm({ patient, onSuccess, onCancel }) {
  const { showToast } = useToast()
  const [values, setValues] = useState({
    doctor_name: '',
    visit_date: getLocalDate(),
    clinical_note: '',
    diagnosis: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setGeneralError('')
  }

  const fieldError = (name) => fieldErrors[name] && (
    <span className="field-error" id={`${name}-error`}>
      {fieldErrors[name]}
    </span>
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setGeneralError('')

    try {
      await createVisit({ patient: patient.id, ...values })
      onSuccess()
    } catch (error) {
      const responseData = error.response?.data
      const nextFieldErrors = {}

      for (const field of ['doctor_name', 'visit_date', 'clinical_note', 'diagnosis', 'patient']) {
        const message = getErrorText(responseData?.[field])
        if (message) nextFieldErrors[field] = message
      }

      setFieldErrors(nextFieldErrors)
      const detail = getErrorText(responseData?.detail)
      const nonFieldError = getErrorText(responseData?.non_field_errors)
      const fallbackMessage = Object.values(nextFieldErrors)[0] ||
        error.message || 'Could not save this visit. Please try again.'
      setGeneralError(
        detail || nonFieldError || (Object.keys(nextFieldErrors).length === 0 ? fallbackMessage : ''),
      )
      showToast(detail || nonFieldError || fallbackMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const patientName = [patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Patient'

  return (
    <div className="modal-backdrop">
      <section
        className="patient-modal visit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-form-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">RECORD VISIT</p>
            <h2 id="visit-form-title">{patientName}</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Close visit form"
            onClick={onCancel}
            disabled={saving}
          >
            ×
          </button>
        </header>

        <form className="patient-form" onSubmit={handleSubmit}>
          {generalError && <div className="form-general-error" role="alert">{generalError}</div>}

          <div className="patient-form-grid">
            <div className="form-field">
              <label htmlFor="visit-doctor-name">Doctor name <span>*</span></label>
              <input
                id="visit-doctor-name"
                name="doctor_name"
                value={values.doctor_name}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.doctor_name)}
                aria-describedby={fieldErrors.doctor_name ? 'doctor_name-error' : undefined}
              />
              {fieldError('doctor_name')}
            </div>

            <div className="form-field">
              <label htmlFor="visit-date">Visit date <span>*</span></label>
              <input
                id="visit-date"
                name="visit_date"
                type="date"
                value={values.visit_date}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.visit_date)}
                aria-describedby={fieldErrors.visit_date ? 'visit_date-error' : undefined}
              />
              {fieldError('visit_date')}
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="visit-clinical-note">Clinical note <span>*</span></label>
              <textarea
                id="visit-clinical-note"
                name="clinical_note"
                rows="4"
                value={values.clinical_note}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.clinical_note)}
                aria-describedby={fieldErrors.clinical_note ? 'clinical_note-error' : undefined}
              />
              {fieldError('clinical_note')}
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="visit-diagnosis">Diagnosis</label>
              <textarea
                id="visit-diagnosis"
                name="diagnosis"
                rows="3"
                value={values.diagnosis}
                onChange={updateField}
                aria-invalid={Boolean(fieldErrors.diagnosis)}
                aria-describedby={fieldErrors.diagnosis ? 'diagnosis-error' : undefined}
              />
              {fieldError('diagnosis')}
            </div>
          </div>

          {fieldErrors.patient && <p className="field-error" role="alert">{fieldErrors.patient}</p>}

          <footer className="modal-footer">
            <button className="button button-quiet" type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Record visit'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default VisitForm
