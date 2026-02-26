import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import logo from '../assets/logo.png'

const API = 'http://localhost:8080/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password })
      if (res.data.success) {
        login({ name: res.data.name, username: res.data.username })
        navigate('/dashboard')
      } else {
        setError(res.data.message)
      }
    } catch {
      setError('Could not connect to server')
    }
  }

  return (
    <div style={styles.page}>
      {/* Background dot grid */}
      <div className="dot-grid" style={styles.grid} />
      <div style={styles.gridOverlay} />

      {/* Corner decorations */}
      <div style={styles.cornerTL} />
      <div style={styles.cornerTR} />
      <div style={styles.cornerBL} />
      <div style={styles.cornerBR} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <img src={logo} alt="Cube Trainer" style={styles.logo} />
          <h1 style={styles.title}>
            CUBE<span style={styles.titleAccent}>TRAINER</span>
          </h1>
          <p style={styles.subtitle}>// AUTHENTICATION REQUIRED</p>
        </div>

        {/* Card */}
        <div className="cyber-card" style={styles.card}>
          <p style={styles.cardTitle}>SIGN IN</p>
          <div style={styles.cardLine} />

          {error && (
            <div style={styles.error}>
              <span style={styles.errorIcon}>⚠</span> {error}
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>USERNAME</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your username"
              autoComplete="off"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your password"
            />
          </div>

          <button className="cyber-btn-filled" style={styles.btn} onClick={handleLogin}>
            ACCESS SYSTEM
          </button>

          <p style={styles.footer}>
            No account?{' '}
            <Link to="/register" style={styles.link}>
              REGISTER
            </Link>
            {' '}|{' '}
            <Link to="/" style={styles.link}>
              BACK
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    opacity: 0.6,
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 30%, var(--bg) 100%)',
    zIndex: 1,
  },
  cornerTL: {
    position: 'absolute', top: 24, left: 24,
    width: 32, height: 32,
    borderTop: '2px solid rgba(0,229,255,0.4)',
    borderLeft: '2px solid rgba(0,229,255,0.4)',
    zIndex: 2,
  },
  cornerTR: {
    position: 'absolute', top: 24, right: 24,
    width: 32, height: 32,
    borderTop: '2px solid rgba(0,229,255,0.4)',
    borderRight: '2px solid rgba(0,229,255,0.4)',
    zIndex: 2,
  },
  cornerBL: {
    position: 'absolute', bottom: 24, left: 24,
    width: 32, height: 32,
    borderBottom: '2px solid rgba(0,229,255,0.4)',
    borderLeft: '2px solid rgba(0,229,255,0.4)',
    zIndex: 2,
  },
  cornerBR: {
    position: 'absolute', bottom: 24, right: 24,
    width: 32, height: 32,
    borderBottom: '2px solid rgba(0,229,255,0.4)',
    borderRight: '2px solid rgba(0,229,255,0.4)',
    zIndex: 2,
  },
  container: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    width: '56px',
    height: '56px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.5))',
    marginBottom: '4px',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.8rem',
    fontWeight: '900',
    color: '#e8f4ff',
    letterSpacing: '0.1em',
  },
  titleAccent: {
    color: '#00e5ff',
    textShadow: '0 0 20px rgba(0,229,255,0.5)',
    marginLeft: '8px',
  },
  subtitle: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(0,229,255,0.5)',
    letterSpacing: '0.2em',
  },
  card: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--primary-bright)',
    letterSpacing: '0.2em',
  },
  cardLine: {
    height: '1px',
    background: 'linear-gradient(to right, var(--primary-bright), transparent)',
    marginBottom: '4px',
  },
  error: {
    background: 'rgba(255,77,109,0.1)',
    border: '1px solid rgba(255,77,109,0.4)',
    color: '#ff4d6d',
    padding: '10px 14px',
    fontSize: '0.85rem',
    fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: '0.05em',
  },
  errorIcon: {
    marginRight: '8px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.15em',
  },
  btn: {
    width: '100%',
    padding: '13px',
    fontSize: '0.9rem',
    marginTop: '4px',
  },
  footer: {
    textAlign: 'center',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  link: {
    color: 'var(--primary-bright)',
    textDecoration: 'none',
    fontWeight: '600',
  },
}