import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:8080/api'

export default function Session() {
    const { sessionName } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const decodedName = decodeURIComponent(sessionName)

    const [scramble, setScramble] = useState('')
    const [solves, setSolves] = useState([])
    const [numSolves, setNumSolves] = useState(0)
    const [ao5, setAo5] = useState(null)
    const [ao12, setAo12] = useState(null)
    const [ao100, setAo100] = useState(null)
    const [timerState, setTimerState] = useState('idle')
    const [displayTime, setDisplayTime] = useState('0.000')
    const [startTime, setStartTime] = useState(null)
    const [activeTab, setActiveTab] = useState('timer')
    const [splits, setSplits] = useState({ cross: '', f2l: '', oll: '', pll: '' })
    const [diagnosis, setDiagnosis] = useState(null)

    useEffect(() => {
        fetchSolves()
        fetchScramble()
    }, [])

    useEffect(() => {
        let interval
        if (timerState === 'running') {
            interval = setInterval(() => {
                setDisplayTime(((Date.now() - startTime) / 1000).toFixed(3))
            }, 10)
        }
        return () => clearInterval(interval)
    }, [timerState, startTime])

    const handleKeyDown = useCallback((e) => {
        if (e.code !== 'Space') return
        e.preventDefault()
        if (timerState === 'idle') {
            setTimerState('ready')
            setDisplayTime('0.000')
        } else if (timerState === 'running') {
            const elapsed = (Date.now() - startTime) / 1000
            setTimerState('idle')
            setDisplayTime(elapsed.toFixed(3))
            submitSolve(elapsed)
        }
    }, [timerState, startTime])

    const handleKeyUp = useCallback((e) => {
        if (e.code !== 'Space') return
        if (timerState === 'ready') {
            setTimerState('running')
            setStartTime(Date.now())
        }
    }, [timerState])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [handleKeyDown, handleKeyUp])

    const fetchScramble = async () => {
        const res = await axios.get(`${API}/scramble`)
        setScramble(res.data.scramble)
    }

    const fetchSolves = async () => {
        const res = await axios.get(`${API}/sessions/${user.username}/${encodeURIComponent(decodedName)}/solves`)
        if (res.data.success) {
            setSolves(res.data.solves || [])
            setNumSolves(res.data.numSolves || 0)
            if (res.data.ao5) setAo5(res.data.ao5)
            if (res.data.ao12) setAo12(res.data.ao12)
            if (res.data.ao100) setAo100(res.data.ao100)
        }
    }

    const submitSolve = async (time) => {
        const res = await axios.post(
            `${API}/sessions/${user.username}/${encodeURIComponent(decodedName)}/solves`,
            { time, scramble }
        )
        if (res.data.success) {
            setNumSolves(res.data.numSolves)
            if (res.data.ao5) setAo5(res.data.ao5)
            if (res.data.ao12) setAo12(res.data.ao12)
            if (res.data.ao100) setAo100(res.data.ao100)
            setSolves(prev => [...prev, { time, scramble }])
            fetchScramble()
        }
    }

    const handleDiagnose = async () => {
        const splitsArray = [
            parseFloat(splits.cross),
            parseFloat(splits.f2l),
            parseFloat(splits.oll),
            parseFloat(splits.pll)
        ]

        if (splitsArray.some(s => isNaN(s) || s <= 0)) {
            alert('Please enter valid times for all four steps')
            return
        }

        try {
            const res = await axios.post(`${API}/diagnose`, {
                username: user.username,
                sessionName: decodedName,
                splits: splitsArray
            })
            if (res.data.success) {
                setDiagnosis(res.data.areasForImprovement)
            }
        } catch (e) {
            console.error('Diagnosis error:', e)
            alert('Could not connect to server')
        }
    }

    const timerColor = timerState === 'ready'
        ? '#00c896'
        : timerState === 'running'
            ? '#00e5ff'
            : 'var(--text)'

    const timerGlow = timerState === 'running'
        ? '0 0 40px rgba(0,229,255,0.4)'
        : timerState === 'ready'
            ? '0 0 40px rgba(0,200,150,0.4)'
            : 'none'

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
                    <p style={styles.navLabel}>// SESSION</p>
                    <h2 style={styles.navTitle}>{decodedName.toUpperCase()}</h2>
                </div>
                <div style={styles.navStats}>
                    {ao5 && <div style={styles.stat}><span style={styles.statLabel}>AO5</span><span style={styles.statVal}>{ao5}</span></div>}
                    {ao12 && <div style={styles.stat}><span style={styles.statLabel}>AO12</span><span style={styles.statVal}>{ao12}</span></div>}
                    {ao100 && <div style={styles.stat}><span style={styles.statLabel}>AO100</span><span style={styles.statVal}>{ao100}</span></div>}
                    <div style={styles.stat}><span style={styles.statLabel}>SOLVES</span><span style={styles.statVal}>{numSolves}</span></div>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                {['timer', 'solves', 'diagnosis'].map(tab => (
                    <button
                        key={tab}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'timer' && '⏱ TIMER'}
                        {tab === 'solves' && '◈ SOLVES'}
                        {tab === 'diagnosis' && '⚕ DIAGNOSIS'}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {/* Timer Tab */}
                {activeTab === 'timer' && (
                    <div style={styles.timerTab}>
                        {/* Scramble */}
                        <div className="cyber-card" style={styles.scrambleCard}>
                            <p style={styles.scrambleLabel}>// SCRAMBLE</p>
                            <p style={styles.scramble}>{scramble}</p>
                            <button className="cyber-btn" style={styles.newScrambleBtn} onClick={fetchScramble}>
                                NEW SCRAMBLE
                            </button>
                        </div>

                        {/* Timer */}
                        <div style={styles.timerArea}>
                            <p style={styles.timerHint}>
                                {timerState === 'idle' && '// HOLD SPACE TO PREPARE'}
                                {timerState === 'ready' && '// RELEASE TO START'}
                                {timerState === 'running' && '// PRESS SPACE TO STOP'}
                            </p>
                            <p style={{
                                ...styles.timerDisplay,
                                color: timerColor,
                                textShadow: timerGlow,
                            }}>
                                {displayTime}
                            </p>
                            <p style={styles.timerSub}>SECONDS</p>
                        </div>
                    </div>
                )}

                {/* Solves Tab */}
                {activeTab === 'solves' && (
                    <div style={styles.solvesTab}>
                        {solves.length === 0 ? (
                            <div className="cyber-card" style={styles.emptyCard}>
                                <p style={styles.emptyIcon}>◈</p>
                                <p style={styles.emptyTitle}>NO SOLVES YET</p>
                                <p style={styles.emptyText}>Head to the Timer tab to start solving.</p>
                            </div>
                        ) : (
                            <div style={styles.solvesList}>
                                {[...solves].reverse().map((s, i) => (
                                    <div key={i} className="cyber-card" style={styles.solveRow}>
                                        <span style={styles.solveNum}>#{solves.length - i}</span>
                                        <span style={styles.solveTime}>{s.time.toFixed(3)}s</span>
                                        <span style={styles.solveScramble}>{s.scramble}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Diagnosis Tab */}
                {activeTab === 'diagnosis' && (
                    <div style={styles.diagnosisTab}>
                        <div className="cyber-card" style={styles.diagnosisCard}>
                            <p style={styles.diagnosisLabel}>// CFOP SPLIT ANALYSIS</p>
                            <p style={styles.diagnosisDesc}>
                                Enter your time splits for each step to identify areas for improvement.
                            </p>
                            <div style={styles.splitsGrid}>
                                {['cross', 'f2l', 'oll', 'pll'].map(step => (
                                    <div key={step} style={styles.splitField}>
                                        <label style={styles.splitLabel}>{step.toUpperCase()}</label>
                                        <input
                                            type="number"
                                            placeholder="0.000"
                                            value={splits[step]}
                                            onChange={e => setSplits(prev => ({ ...prev, [step]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button className="cyber-btn-filled" style={styles.diagnoseBtn} onClick={handleDiagnose}>
                                RUN ANALYSIS
                            </button>
                        </div>

                        {diagnosis !== null && (
                            <div className="cyber-card" style={styles.resultCard}>
                                <p style={styles.diagnosisLabel}>// ANALYSIS RESULT</p>
                                {diagnosis.length === 0 ? (
                                    <div style={styles.optimalResult}>
                                        <span style={styles.optimalIcon}>✓</span>
                                        <div>
                                            <p style={styles.optimalTitle}>SPLITS OPTIMAL</p>
                                            <p style={styles.optimalText}>Your current splits are well balanced. Keep pushing!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.areasResult}>
                                        <p style={styles.areasTitle}>FOCUS AREAS IDENTIFIED:</p>
                                        <div style={styles.areaTags}>
                                            {diagnosis.map((area, i) => (
                                                <div key={i} style={styles.areaTag}>
                                                    ▶ {area.toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        flexWrap: 'wrap',
        gap: '12px',
    },
    backBtn: {
        padding: '7px 16px',
        fontSize: '0.8rem',
    },
    navCenter: {
        textAlign: 'center',
    },
    navLabel: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.65rem',
        color: 'rgba(0,229,255,0.5)',
        letterSpacing: '0.2em',
    },
    navTitle: {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1rem',
        fontWeight: '700',
        color: 'var(--primary-bright)',
        letterSpacing: '0.1em',
    },
    navStats: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
    },
    stat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
    },
    statLabel: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
    },
    statVal: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.9rem',
        color: 'var(--primary-bright)',
        fontWeight: '600',
    },
    tabs: {
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,11,16,0.8)',
        backdropFilter: 'blur(10px)',
    },
    tab: {
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        padding: '14px 24px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: '0.1em',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
    },
    activeTab: {
        borderBottom: '2px solid var(--primary-bright)',
        color: 'var(--primary-bright)',
    },
    content: {
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    timerTab: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'center',
    },
    scrambleCard: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
        textAlign: 'center',
    },
    scrambleLabel: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.7rem',
        color: 'rgba(0,229,255,0.5)',
        letterSpacing: '0.2em',
        alignSelf: 'flex-start',
    },
    scramble: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '1.1rem',
        color: 'var(--text)',
        letterSpacing: '0.08em',
        lineHeight: 1.6,
    },
    newScrambleBtn: {
        padding: '7px 20px',
        fontSize: '0.75rem',
    },
    timerArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '32px 0',
    },
    timerHint: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.75rem',
        color: 'rgba(0,229,255,0.4)',
        letterSpacing: '0.15em',
        marginBottom: '8px',
    },
    timerDisplay: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 'clamp(4rem, 12vw, 7rem)',
        fontWeight: '400',
        letterSpacing: '0.05em',
        transition: 'color 0.15s, text-shadow 0.15s',
        lineHeight: 1,
    },
    timerSub: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.3em',
        marginTop: '4px',
    },
    solvesTab: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
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
        fontSize: '2rem',
        color: 'var(--primary-bright)',
        opacity: 0.3,
    },
    emptyTitle: {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.2em',
    },
    emptyText: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    solvesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    solveRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
    },
    solveNum: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        minWidth: '36px',
    },
    solveTime: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '1rem',
        color: 'var(--primary-bright)',
        fontWeight: '600',
        minWidth: '80px',
    },
    solveScramble: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        flex: 1,
    },
    diagnosisTab: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    diagnosisCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    diagnosisLabel: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.7rem',
        color: 'rgba(0,229,255,0.5)',
        letterSpacing: '0.2em',
    },
    diagnosisDesc: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
    },
    splitsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    splitField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    splitLabel: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
    },
    diagnoseBtn: {
        alignSelf: 'flex-start',
        padding: '10px 24px',
        fontSize: '0.85rem',
    },
    resultCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    optimalResult: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    optimalIcon: {
        fontSize: '2rem',
        color: 'var(--success)',
        fontFamily: "'Share Tech Mono', monospace",
    },
    optimalTitle: {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '0.9rem',
        color: 'var(--success)',
        letterSpacing: '0.1em',
        marginBottom: '4px',
    },
    optimalText: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    areasResult: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    areasTitle: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
    },
    areaTags: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    areaTag: {
        background: 'rgba(0,229,255,0.1)',
        border: '1px solid var(--border-bright)',
        color: 'var(--primary-bright)',
        padding: '8px 16px',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '0.85rem',
        letterSpacing: '0.1em',
    },
}