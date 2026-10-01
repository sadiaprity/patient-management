import { useCallback, useEffect, useState } from 'react'
import { deletePatient, getPatients } from './api/patients'
import ConfirmDialog from './ConfirmDialog'
import Pagination from './Pagination'
import { useToast } from './useToast'
import VisitHistory from './VisitHistory'
import VisitForm from './VisitForm'

const EMPTY_DATA = { count: 0, results: [], previous: null, next: null }

function PatientList({ onAddPatient, onEditPatient, onRefreshReady, currentUser }) {
  const { showToast } = useToast()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadVersion, setReloadVersion] = useState(0)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [visitPatient, setVisitPatient] = useState(null)
  const [historyPatient, setHistoryPatient] = useState(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setErrorMessage('')
    setReloadVersion((version) => version + 1)
  }, [])

  const handlePageChange = (nextPage) => {
    setLoading(true)
    setErrorMessage('')
    setPage(nextPage)
  }

  useEffect(() => {
    onRefreshReady?.(refresh)
    return () => onRefreshReady?.(null)
  }, [onRefreshReady, refresh])

  useEffect(() => {
    let active = true

    getPatients(page)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(
            error.response?.data?.detail || 'Could not load patient records.',
          )
          showToast(
            error.response?.data?.detail || 'Could not load patient records.',
            'error',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, reloadVersion, showToast])

  const handleDelete = (patient) => {
    setPendingDelete(patient)
  }

  const handleCancelDelete = () => {
    if (!deleteLoading) setPendingDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return

    setDeleteLoading(true)
    setErrorMessage('')

    try {
      await deletePatient(pendingDelete.id)
      showToast('Patient deleted.', 'success')
      setPendingDelete(null)

      if (page > 1 && data.results.length === 1) {
        setLoading(true)
        setPage(page - 1)
      } else {
        refresh()
      }
    } catch (error) {
      setPendingDelete(null)
      const message = error.response?.data?.detail || 'Could not delete this patient.'
      setErrorMessage(message)
      showToast(message, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleVisitSuccess = () => {
    setVisitPatient(null)
    refresh()
    showToast('Visit recorded.', 'success')
  }

  const handleRecordFromHistory = () => {
    setVisitPatient(historyPatient)
    setHistoryPatient(null)
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARE OVERVIEW</p>
          <h1>Patients</h1>
          <p className="page-subtitle">Patient records and visit summaries.</p>
        </div>
        <div className="page-heading-actions">
          <p className="patients-total">Total <strong>{data.count}</strong></p>
          <button className="button button-primary" type="button" onClick={onAddPatient}>
            Add Patient
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="error-banner" role="alert">
          <span>{errorMessage}</span>
          <button className="button button-quiet retry-button" type="button" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      <section className="patient-card" aria-label="Patient records">
        {loading ? (
          <p className="state-message" role="status">Loading patient records...</p>
        ) : errorMessage ? null : data.count === 0 ? (
          <div className="empty-state">
            <p>No patients found</p>
            <button className="button button-primary" type="button" onClick={onAddPatient}>
              Add Patient
            </button>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Mobile</th>
                    <th scope="col">Age</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Blood group</th>
                    <th scope="col">Visits</th>
                    <th scope="col">Last visit</th>
                    <th className="actions-column" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((patient) => {
                    const isCurrentUser = String(patient.id) === String(currentUser?.id)
                    const patientName = [patient.first_name, patient.last_name]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td className="patient-name">
                        {patientName || '—'}
                        {isCurrentUser && <span className="you-badge">You</span>}
                      </td>
                      <td>{patient.mobile}</td>
                      <td>{patient.age ?? '—'}</td>
                      <td>{patient.gender || '—'}</td>
                      <td>
                        <span className="blood-group-badge">{patient.blood_group || '—'}</span>
                      </td>
                      <td>{patient.total_visits ?? 0}</td>
                      <td>{patient.last_visit_date || '—'}</td>
                      <td className="actions-column">
                        <div className="patient-actions">
                          <button
                            className="action-button"
                            type="button"
                            title="History"
                            aria-label={`History for ${patientName || 'patient'}`}
                            onClick={() => setHistoryPatient(patient)}
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                              <circle cx="12" cy="12" r="8" />
                              <path d="M12 8v4l2.5 1.5M5.5 5.5 4 7" />
                            </svg>
                          </button>
                          <button
                            className="action-button"
                            type="button"
                            title="Record Visit"
                            aria-label={`Record visit for ${patientName || 'patient'}`}
                            onClick={() => setVisitPatient(patient)}
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                              <rect x="5" y="5" width="14" height="16" rx="2" />
                              <path d="M9 3h6v4H9zM12 10v6M9 13h6" />
                            </svg>
                          </button>
                          <button
                            className="action-button"
                            type="button"
                            title="Edit"
                            aria-label={`Edit ${patientName || 'patient'}`}
                            onClick={() => onEditPatient?.(patient)}
                          >
                            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                              <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                            </svg>
                          </button>
                          <span
                            className="action-tooltip"
                            title={isCurrentUser ? "You can't delete your own account" : undefined}
                          >
                            <button
                              className="action-button action-button-danger"
                              type="button"
                              title={isCurrentUser ? "You can't delete your own account" : 'Delete'}
                              aria-label={isCurrentUser ? "You can't delete your own account" : `Delete ${patientName || 'patient'}`}
                              disabled={isCurrentUser}
                              onClick={() => handleDelete(patient)}
                            >
                              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
                              </svg>
                            </button>
                          </span>
                        </div>
                      </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} data={data} onPageChange={handlePageChange} />
          </>
        )}
      </section>
      {pendingDelete && (
        <ConfirmDialog
          title="Delete Patient?"
          message={`Are you sure you want to delete ${
            [pendingDelete.first_name, pendingDelete.last_name].filter(Boolean).join(' ') || 'this patient'
          }? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={deleteLoading}
        />
      )}
      {historyPatient && (
        <VisitHistory
          patient={historyPatient}
          onClose={() => setHistoryPatient(null)}
          onRecordVisit={handleRecordFromHistory}
        />
      )}
      {visitPatient && (
        <VisitForm
          patient={visitPatient}
          onSuccess={handleVisitSuccess}
          onCancel={() => setVisitPatient(null)}
        />
      )}
    </main>
  )
}

export default PatientList
