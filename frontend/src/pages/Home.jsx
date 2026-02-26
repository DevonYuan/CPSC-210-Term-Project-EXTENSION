import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import bg from '../assets/bg.jpg'

export default function Home() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(0)

  // Staggered animation phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)   // title appears
    const t2 = setTimeout(() => setPhase(2), 900)   // logo appears
    const t3 = setTimeout(() => setPhase(3), 1500)  // button appears
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={styles.page}>
      {/* Background */}
      <div style={styles.bgImage} />
      <div style={styles.bgOverlay} />
      <div style={styles.bgBlur} />

      {/* Scanline effect */}
      <div style={styles.scanline} />

      {/* Corner decorations */}
      <div style={styles.cornerTL} />
      <div style={styles.cornerTR} />
      <div style={styles.cornerBL} />
      <div style={styles.cornerBR} />

      {/* Content */}
      <div style={styles.content}>

        {/* Title */}
        <div style={{
          ...styles.titleWrap,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(-40px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}>
          <p style={styles.subtitle}>// SPEEDCUBING PERFORMANCE SYSTEM</p>
          <h1 style={styles.title}>
            CUBE<span style={styles.titleAccent}>TRAINER</span>
          </h1>
          <div style={styles.titleLine} />
        </div>

        {/* Logo */}
        <div style={{
          ...styles.logoWrap,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}>
          <div style={styles.logoGlow} />
          <img src={logo} alt="Cube Trainer Logo" style={styles.logo} />
        </div>

        {/* Enter button */}
        <div style={{
          ...styles.btnWrap,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}>
          <button
            className="cyber-btn"
            style={styles.enterBtn}
            onClick={() => navigate('/login')}
          >
            <span style={styles.enterBtnInner}>
              ▶ &nbsp; ENTER SYSTEM
            </span>
          </button>
          <p style={styles.enterHint}>Sign in or create an account to begin</p>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <span style={styles.bottomText}>CUBE TRAINER v1.0</span>
        <span style={styles.bottomText}>POWERED BY AI</span>
      </div>
    </div>
  )
}

const styles = {
  page: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#080b10',
  },
  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${bg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(3px) brightness(0.35)',
    transform: 'scale(1.05)',
    zIndex: 0,
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(0,180,216,0.05) 0%, rgba(8,11,16,0.85) 70%)',
    zIndex: 1,
  },
  bgBlur: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(8,11,16,0.6) 0%, transparent 40%, transparent 60%, rgba(8,11,16,0.8) 100%)',
    zIndex: 2,
  },
  scanline: {
    position: 'absolute',
    width: '100%',
    height: '2px',
    background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.08), transparent)',
    animation: 'scanline 6s linear infinite',
    zIndex: 3,
    pointerEvents: 'none',
  },
  cornerTL: {
    position: 'absolute', top: 24, left: 24,
    width: 40, height: 40,
    borderTop: '2px solid rgba(0,229,255,0.6)',
    borderLeft: '2px solid rgba(0,229,255,0.6)',
    zIndex: 4,
  },
  cornerTR: {
    position: 'absolute', top: 24, right: 24,
    width: 40, height: 40,
    borderTop: '2px solid rgba(0,229,255,0.6)',
    borderRight: '2px solid rgba(0,229,255,0.6)',
    zIndex: 4,
  },
  cornerBL: {
    position: 'absolute', bottom: 24, left: 24,
    width: 40, height: 40,
    borderBottom: '2px solid rgba(0,229,255,0.6)',
    borderLeft: '2px solid rgba(0,229,255,0.6)',
    zIndex: 4,
  },
  cornerBR: {
    position: 'absolute', bottom: 24, right: 24,
    width: 40, height: 40,
    borderBottom: '2px solid rgba(0,229,255,0.6)',
    borderRight: '2px solid rgba(0,229,255,0.6)',
    zIndex: 4,
  },
  content: {
    position: 'relative',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    textAlign: 'center',
    padding: '24px',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  subtitle: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.75rem',
    color: 'rgba(0,229,255,0.6)',
    letterSpacing: '0.2em',
    marginBottom: '4px',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontWeight: '900',
    color: '#e8f4ff',
    letterSpacing: '0.1em',
    lineHeight: 1,
  },
  titleAccent: {
    color: '#00e5ff',
    textShadow: '0 0 30px rgba(0,229,255,0.6)',
    marginLeft: '12px',
  },
  titleLine: {
    width: '120px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #00e5ff, transparent)',
    marginTop: '12px',
  },
  logoWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
    animation: 'pulse-glow 3s ease-in-out infinite',
  },
  logo: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    position: 'relative',
    filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.4))',
  },
  btnWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  enterBtn: {
    padding: '14px 48px',
    fontSize: '1rem',
    letterSpacing: '0.15em',
    animation: 'pulse-glow 3s ease-in-out infinite',
  },
  enterBtnInner: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: '600',
  },
  enterHint: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.75rem',
    color: 'rgba(0,229,255,0.4)',
    letterSpacing: '0.1em',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(0,229,255,0.1)',
    zIndex: 5,
  },
  bottomText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(0,229,255,0.3)',
    letterSpacing: '0.15em',
  },
}