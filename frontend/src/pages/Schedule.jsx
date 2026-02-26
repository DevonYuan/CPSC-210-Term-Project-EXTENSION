import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:8080/api'
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COOLDOWN_SECONDS = 15

export default function Schedule() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [timeWindows, setTimeWindows] = useState(
    DAYS.map(day => ({ day, windows: '' }))
  )
  const [skills, setSkills] = useState([''])
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const isSubmitting = useRef(false)
  const cooldownRef = useRef(null)

  const handleWindowChange = (i, val) => {
    const updated = [...timeWindows]
    updated[i].windows = val
    setTimeWindows(updated)
  }

  const handleSkillChange = (i, val) => {
    const updated = [...skills]
    updated[i] = val
    setSkills(updated)
  }

  const addSkill = () => setSkills([...skills, ''])
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i))

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleGenerate = useCallback(async () => {
    if (isSubmitting.current || cooldown > 0) return
    const hasAnyWindow = timeWindows.some(w => w.windows.trim() !== '')
    if (!hasAnyWindow) {
      setError('Please enter at least one available time window')
      return
    }

    isSubmitting.current = true
    setLoading(true)
    setError('')
    setSchedule(null)

    try {
      const res = await axios.post(`${API}/schedule/ai`, {
        username: user.username,
        timeWindows,
        skills: skills.filter(s => s.trim() !== '')
      })
      if (res.data.success) {
        setSchedule(res.data.schedule)
      } else {
        setError(res.data.message || 'Generation failed. Try again in a moment.')
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
      isSubmitting.current = false
      startCooldown()
    }
  }, [timeWindows, skills, user, cooldown])

  const renderLine = (line) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: 'var(--primary-bright)' }}>{part}</strong>
        : part
    )
  }

  const buttonDisabled = loading || cooldown > 0

  return (
    <div style={styles.page}>
      <div className="dot-grid" style={styles.grid} />
      <div style={styles.gridOverlay} />

      {/* Navbar */}
      <div style={styles.navbar}>
        <button className="cyber-btn" style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← DASHBOARD
        </button>
        <div style={styles.navCenter}>
          <p style={styles.navLabel}>// AI TRAINING SYSTEM</p>
          <h2 style={styles.navTitle}>PRACTICE SCHEDULE</h2>
        </div>
        <div style={{ width: '120px' }} />
      </div>

      <div style={styles.content}>

        {/* Time Windows */}
        <div className="cyber-card" style={styles.card}>
          <p style={styles.cardLabel}>// WEEKLY AVAILABILITY</p>
          <p style={styles.cardDesc}>
            Enter your available time windows for each day. Use formats like{' '}
            <span style={styles.example}>5:00pm-6:00pm</span> or{' '}
            <span style={styles.example}>5:00pm-6:00pm, 8:00pm-8:30pm</span>.
            Leave blank if unavailable.
          </p>
          <div style={styles.daysGrid}>
            {DAYS.map((day, i) => (
              <div key={day} style={styles.dayField}>
                <label style={styles.dayLabel}>{day.toUpperCase()}</label>
                <input
                  value={timeWindows[i].windows}
                  onChange={e => handleWindowChange(i, e.target.value)}
                  placeholder="e.g. 5:00pm-6:00pm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="cyber-card" style={styles.card}>
          <p style={styles.cardLabel}>// FOCUS SKILLS</p>
          <p style={styles.cardDesc}>
            Add specific skills to focus on. Standard full solves are always included.
          </p>
          <div style={styles.skillsList}>
            {skills.map((skill, i) => (
              <div key={i} style={styles.skillRow}>
                <input
                  value={skill}
                  onChange={e => handleSkillChange(i, e.target.value)}
                  placeholder={`Skill ${i + 1} — e.g. F2L, OLL recognition, fingertricks`}
                />
                {skills.length > 1 && (
                  <button
                    className="cyber-btn"
                    style={styles.removeBtn}
                    onClick={() => removeSkill(i)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="cyber-btn" style={styles.addSkillBtn} onClick={addSkill}>
              + ADD SKILL
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>⚠ {error}</p>}

        <button
          className={buttonDisabled ? 'cyber-btn' : 'cyber-btn-filled'}
          style={{
            ...styles.generateBtn,
            opacity: buttonDisabled ? 0.5 : 1,
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
          }}
          onClick={handleGenerate}
          disabled={buttonDisabled}
        >
          {loading
            ? '⏳ GENERATING...'
            : cooldown > 0
            ? `⏸ COOLDOWN — ${cooldown}s`
            : '▶ GENERATE AI SCHEDULE'}
        </button>

        {loading && (
          <div className="cyber-card" style={styles.loadingCard}>
            <p style={styles.loadingLabel}>// CONTACTING AI COACH</p>
            <p style={styles.loadingText}>Analyzing your availability and goals...</p>
            <div style={styles.loadingBar}>
              <div style={styles.loadingFill} />
            </div>
          </div>
        )}

        {schedule && (
          <div className="cyber-card" style={styles.resultsCard}>
            <p style={styles.cardLabel}>// AI GENERATED SCHEDULE</p>
            <div style={styles.aiResponse}>
              {schedule.split('\n').map((line, i) => {
                if (line.trim() === '') return <div key={i} style={styles.blankLine} />
                const isDayHeader = DAYS.some(d =>
                  line.toLowerCase().startsWith(d.toLowerCase())
                )
                const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*')
                const isNumbered = /^\d+\./.test(line.trim())
                return (
                  <p
                    key={i}
                    style={
                      isDayHeader ? styles.aiDay
                      : isBullet || isNumbered ? styles.aiBullet
                      : styles.aiLine
                    }
                  >
                    {renderLine(line)}
                  </p>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' },
  grid: { position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 },
  gridOverlay: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, var(--bg) 100%)', zIndex: 1 },
  navbar: { position: 'relative', zIndex: 10, background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)' },
  backBtn: { padding: '7px 16px', fontSize: '0.8rem' },
  navCenter: { textAlign: 'center' },
  navLabel: { fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', color: 'rgba(0,229,255,0.5)', letterSpacing: '0.2em' },
  navTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', fontWeight: '700', color: 'var(--primary-bright)', letterSpacing: '0.1em' },
  content: { position: 'relative', zIndex: 2, maxWidth: '700px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { display: 'flex', flexDirection: 'column', gap: '16px' },
  cardLabel: { fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', color: 'rgba(0,229,255,0.5)', letterSpacing: '0.2em' },
  cardDesc: { fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px', lineHeight: 1.6 },
  example: { fontFamily: "'Share Tech Mono', monospace", color: 'var(--primary-bright)', fontSize: '0.8rem' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  dayField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  dayLabel: { fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.15em' },
  skillsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  skillRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  removeBtn: { padding: '8px 14px', fontSize: '0.8rem', borderColor: 'rgba(255,77,109,0.5)', color: 'rgba(255,77,109,0.8)', whiteSpace: 'nowrap' },
  addSkillBtn: { alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' },
  error: { fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem', color: '#ff4d6d' },
  generateBtn: { padding: '14px', fontSize: '0.95rem', width: '100%' },
  loadingCard: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', padding: '32px', textAlign: 'center' },
  loadingLabel: { fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', color: 'rgba(0,229,255,0.5)', letterSpacing: '0.2em' },
  loadingText: { fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem', color: 'var(--text-muted)' },
  loadingBar: { width: '100%', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' },
  loadingFill: { height: '100%', width: '40%', background: 'var(--primary-bright)', borderRadius: '1px', animation: 'scanline 1.5s ease-in-out infinite' },
  resultsCard: { display: 'flex', flexDirection: 'column', gap: '16px' },
  aiResponse: { display: 'flex', flexDirection: 'column', gap: '4px' },
  aiDay: { fontFamily: "'Orbitron', sans-serif", fontSize: '0.85rem', color: 'var(--primary-bright)', letterSpacing: '0.1em', marginTop: '12px', marginBottom: '4px' },
  aiBullet: { fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'var(--text)', paddingLeft: '16px', lineHeight: 1.6 },
  aiLine: { fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 },
  blankLine: { height: '8px' },
}