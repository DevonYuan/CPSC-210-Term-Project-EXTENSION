import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import logo from '../assets/logo.png'

const API = 'http://localhost:8080/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [newSessionName, setNewSessionName] = useState('')
  const [showNewSession, setShowNewSession] = useState(false)
  const [conflictSession, setConflictSession] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API}/sessions/${user.username}`)
      setSessions(res.data)
    } catch {
      setError('Could not load sessions')
    }
  }

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return
    try {
      const res = await axios.post(`${API}/sessions/${user.username}`, {
        sessionName: newSessionName,
        mode: 'new'
      })
      if (res.data.success) {
        await fetchSessions()
        navigate(`/session/${encodeURIComponent(newSessionName)}`)
      } else {
        setConflictSession(newSessionName)
      }
    } catch {
      setError('Could not create session')
    }
  }

  const handleConflict = async (mode) => {
    try {
      await axios.post(`${API}/sessions/${user.username}`, {
        sessionName: conflictSession,
        mode
      })
      const name = conflictSession
      setConflictSession(null)
      navigate(`/session/${encodeURIComponent(name)}`)
    } catch {
      setError('Could not open session')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={styles.page}>
      <div className="dot-grid" style={styles.grid} />
      <div style={styles.gridOverlay} />

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="logo" style={styles.navLogo} />
          <span style={styles.navTitle}>
            CUBE<span style={styles.navTitleAccent}>TRAINER</span>
          </span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>// {user.name.toUpperCase()}</span>
          <button
            className="cyber-btn"
            style={styles.scheduleBtn}
            onClick={() => navigate('/schedule')}
          >
            📅 SCHEDULE
          </button>
          <button className="cyber-btn" style={styles.logoutBtn} onClick={handleLogout}>
            LOG OUT
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* Header row */}
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionLabel}>// PRACTICE SESSIONS</p>
            <h2 style={styles.sectionTitle}>Your Sessions</h2>
          </div>
          <button
            className="cyber-btn-filled"
            style={styles.newBtn}
            onClick={() => setShowNewSession(!showNewSession)}
          >
            + NEW SESSION
          </button>
        </div>

        {/* New session form */}
        {showNewSession && (
          <div className="cyber-card" style={styles.newSessionCard}>
            <p style={styles.formLabel}>SESSION NAME</p>
            <div style={styles.newSessionForm}>
              <input
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
                placeholder="e.g. TPS Practice, Slow Turning..."
                autoFocus
              />
              <button className="cyber-btn-filled" style={styles.createBtn} onClick={handleCreateSession}>
                CREATE
              </button>
              <button className="cyber-btn" style={styles.cancelBtn} onClick={() => setShowNewSession(false)}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Conflict resolution */}
        {conflictSession && (
          <div className="cyber-card" style={styles.conflictCard}>
            <p style={styles.conflictText}>
              <span style={styles.conflictAccent}>⚠ CONFLICT:</span> A session named{' '}
              <span style={styles.conflictName}>"{conflictSession}"</span> already exists.
            </p>
            <div style={styles.conflictBtns}>
              <button className="cyber-btn-filled" onClick={() => handleConflict('resume')}>
                RESUME
              </button>
              <button
                className="cyber-btn"
                style={styles.overwriteBtn}
                onClick={() => handleConflict('overwrite')}
              >
                OVERWRITE
              </button>
              <button className="cyber-btn" onClick={() => setConflictSession(null)}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {error && <p style={styles.error}>⚠ {error}</p>}

        {/* Sessions grid */}
        {sessions.length === 0 ? (
          <div className="cyber-card" style={styles.emptyCard}>
            <p style={styles.emptyIcon}>◈</p>
            <p style={styles.emptyTitle}>NO SESSIONS YET</p>
            <p style={styles.emptyText}>Create your first practice session to get started.</p>
          </div>
        ) : (
          <div style={styles.sessionGrid}>
            {sessions.map((session, i) => (
              <div
                key={i}
                className="cyber-card"
                style={styles.sessionCard}
                onClick={() => navigate(`/session/${encodeURIComponent(session.name)}`)}
              >
                <div style={styles.sessionCardTop}>
                  <span style={styles.sessionIcon}>◈</span>
                  <span style={styles.sessionSolves}>{session.numSolves} SOLVES</span>
                </div>
                <h3 style={styles.sessionName}>{session.name}</h3>
                <div style={styles.sessionCardBottom}>
                  <span style={styles.sessionEnter}>ENTER →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    opacity: 0.4,
  },
  gridOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 40%, var(--bg) 100%)',
    zIndex: 1,
  },
  navbar: {
    position: 'relative',
    zIndex: 10,
    background: 'var(--nav-bg)',
    borderBottom: '1px solid var(--border)',
    padding: '12px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backdropFilter: 'blur(10px)',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogo: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.5))',
  },
  navTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.1rem',
    fontWeight: '900',
    color: '#e8f4ff',
    letterSpacing: '0.1em',
  },
  navTitleAccent: {
    color: '#00e5ff',
    marginLeft: '6px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navUser: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.8rem',
    color: 'rgba(0,229,255,0.6)',
    letterSpacing: '0.1em',
  },
  scheduleBtn: {
    padding: '7px 16px',
    fontSize: '0.8rem',
  },
  logoutBtn: {
    padding: '7px 16px',
    fontSize: '0.8rem',
    borderColor: 'rgba(255,77,109,0.5)',
    color: 'rgba(255,77,109,0.8)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(0,229,255,0.5)',
    letterSpacing: '0.2em',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text)',
  },
  newBtn: {
    padding: '10px 20px',
    fontSize: '0.8rem',
  },
  newSessionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.15em',
  },
  newSessionForm: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  createBtn: {
    whiteSpace: 'nowrap',
    padding: '10px 20px',
    fontSize: '0.8rem',
  },
  cancelBtn: {
    whiteSpace: 'nowrap',
    padding: '10px 20px',
    fontSize: '0.8rem',
  },
  conflictCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  conflictText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.85rem',
    color: 'var(--text)',
  },
  conflictAccent: {
    color: '#ff4d6d',
    marginRight: '8px',
  },
  conflictName: {
    color: 'var(--primary-bright)',
  },
  conflictBtns: {
    display: 'flex',
    gap: '10px',
  },
  overwriteBtn: {
    borderColor: 'rgba(255,77,109,0.5)',
    color: 'rgba(255,77,109,0.8)',
  },
  error: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.85rem',
    color: '#ff4d6d',
  },
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '60px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    color: 'var(--primary-bright)',
    opacity: 0.4,
  },
  emptyTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.2em',
  },
  emptyText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  sessionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  sessionCard: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    padding: '20px',
  },
  sessionCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionIcon: {
    color: 'var(--primary-bright)',
    fontSize: '1.2rem',
  },
  sessionSolves: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  sessionName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text)',
  },
  sessionCardBottom: {
    borderTop: '1px solid var(--border)',
    paddingTop: '10px',
  },
  sessionEnter: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.75rem',
    color: 'var(--primary-bright)',
    letterSpacing: '0.1em',
  },
}