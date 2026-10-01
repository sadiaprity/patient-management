import { useState } from 'react'
import { createPatient, updatePatient } from './api/patients'
import { useToast } from './useToast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const getErrorText = (value) => {
  if (Array.isArray(value)) return value.join(' ')
  if (typeof value === 'string') return value
  return ''
}

function PatientForm({ initialData, onSuccess, onCancel }) {
  const { showToast } = useToast()
  const isEdit = Boolean(initialData?.id)
  const [values, setValues] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    mobile: initialData?.mobile || '',
    age: initialData?.age ?? '',
    gender: initialData?.gender || '',
    blood_group: initialData?.blood_group || '',
    address: initialData?.address || '',
    password: '',
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setGeneralError('')

    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      mobile: values.mobile,
      age: Number(values.age),
      gender: values.gender,
      blood_group: values.blood_group,
      address: values.address,
    }

    if (values.password) payload.password = values.password

    try {
      if (isEdit) {
        await updatePatient(initialData.id, payload)
      } else {
        await createPatient(payload)
      }
      onSuccess()
    } catch (error) {
      const responseData = error.response?.data
      const nextFieldErrors = {}

      for (const field of [
        'first_name',
        'last_name',
        'mobile',
        'age',
        'gender',
        'blood_group',
        'address',
        'password',
      ]) {
        const message = getErrorText(responseData?.[field])
        if (message) nextFieldErrors[field] = message
      }

      setFieldErrors(nextFieldErrors)
      const detail = getErrorText(responseData?.detail)
      const nonFieldError = getErrorText(responseData?.non_field_errors)
      const fallbackMessage = Object.values(nextFieldErrors)[0] ||
        error.message || 'Could not save this patient. Please try again.'
      setGeneralError(
        detail || nonFieldError || (Object.keys(nextFieldErrors).length === 0 ? fallbackMessage : ''),
      )
      showToast(detail || nonFieldError || fallbackMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (name) => fieldErrors[name] && (
    <span className="field-error" id={`${name}-error`}>
      {fieldErrors[name]}
    </span>
  )

  return (
    <div className="modal-backdrop">
      <section
        className="patient-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-form-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">PATIENT RECORD</p>
            <h2 id="patient-form-title">{isEdit ? 'Edit patient' : 'Add patient'}</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Close patient form"
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
              <label htmlFor="patient-first-name">First name <span>*</span></label>
              <input
                id="patient-first-name"
                name="first_name"
                value={values.first_name}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.first_name)}
                aria-describedby={fieldErrors.first_name ? 'first_name-error' : undefined}
              />
              {fieldError('first_name')}
            </div>

            <div className="form-field">
              <label htmlFor="patient-last-name">Last name</label>
              <input
                id="patient-last-name"
                name="last_name"
                value={values.last_name}
                onChange={updateField}
                aria-invalid={Boolean(fieldErrors.last_name)}
                aria-describedby={fieldErrors.last_name ? 'last_name-error' : undefined}
              />
              {fieldError('last_name')}
            </div>

            <div className="form-field">
              <label htmlFor="patient-mobile">Mobile <span>*</span></label>
              <input
                id="patient-mobile"
                name="mobile"
                type="tel"
                inputMode="tel"
                value={values.mobile}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.mobile)}
                aria-describedby={fieldErrors.mobile ? 'mobile-error' : undefined}
              />
              {fieldError('mobile')}
            </div>

            <div className="form-field">
              <label htmlFor="patient-age">Age <span>*</span></label>
              <input
                id="patient-age"
                name="age"
                type="number"
                min="1"
                value={values.age}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.age)}
                aria-describedby={fieldErrors.age ? 'age-error' : undefined}
              />
              {fieldError('age')}
            </div>

            <div className="form-field">
              <label htmlFor="patient-gender">Gender <span>*</span></label>
              <select
                id="patient-gender"
                name="gender"
                value={values.gender}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.gender)}
                aria-describedby={fieldErrors.gender ? 'gender-error' : undefined}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {fieldError('gender')}
            </div>

            <div className="form-field">
              <label htmlFor="patient-blood-group">Blood group <span>*</span></label>
              <select
                id="patient-blood-group"
                name="blood_group"
                value={values.blood_group}
                onChange={updateField}
                required
                aria-invalid={Boolean(fieldErrors.blood_group)}
                aria-describedby={fieldErrors.blood_group ? 'blood_group-error' : undefined}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              {fieldError('blood_group')}
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="patient-address">Address</label>
              <textarea
                id="patient-address"
                name="address"
                rows="3"
                value={values.address}
                onChange={updateField}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? 'address-error' : undefined}
              />
              {fieldError('address')}
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="patient-password">Password{!isEdit && <span> *</span>}</label>
              <input
                id="patient-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={updateField}
                required={!isEdit}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password
                    ? 'password-error'
                    : isEdit
                      ? 'password-help'
                      : undefined
                }
              />
              {isEdit && (
                <span className="field-help" id="password-help">
                  Leave blank to keep current password
                </span>
              )}
              {fieldError('password')}
            </div>
          </div>

          <footer className="modal-footer">
            <button className="button button-quiet" type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add patient'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default PatientForm
