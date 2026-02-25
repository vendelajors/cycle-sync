/**
 * Shared SVG Icon Library
 * Use: import { Icons } from './icons'
 * Then: <Icons.moon size={16} color="#6B7DB3" />
 */

const Icon = ({ d, size = 16, color = '#A09A90', style, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} {...props}>
    <path d={d} />
  </svg>
)

export const Icons = {
  // Navigation
  arrowLeft: (p) => <Icon {...p} d="M19 12H5M12 19l-7-7 7-7" />,
  arrowRight: (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />,
  check: (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  x: (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />,

  // Dashboard
  sun: (p) => <Icon {...p} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.73-12.73l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z" />,
  moon: (p) => <Icon {...p} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  heart: (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  activity: (p) => <Icon {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  trending: (p) => <Icon {...p} d="M23 6l-9.5 9.5-5-5L1 18" />,
  zap: (p) => <Icon {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  chart: (p) => <Icon {...p} d="M18 20V10M12 20V4M6 20v-6" />,

  // Health
  thermometer: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"
      stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  ),
  shield: (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  droplet: (p) => <Icon {...p} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />,
  flask: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"
      stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M9 3h6M10 3v7.4a2 2 0 01-.5 1.3L4 19a2 2 0 001.5 3h13a2 2 0 001.5-3l-5.5-7.3a2 2 0 01-.5-1.3V3" />
    </svg>
  ),

  // Wearable / Ring
  ring: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"
      stroke={p.color||'#A09A90'} strokeWidth="2" style={p.style}>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
    </svg>
  ),
  footprints: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"
      stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5 10 7.39 9 9 8 10H4" />
      <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6-1.87 0-2.5 1.8-2.5 3.5 0 1.89 1 3.5 2 4.5h4" />
    </svg>
  ),

  // Actions
  refresh: ({ size = 16, color = '#A09A90', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.5" strokeDasharray="4 2.5" />
      <circle cx="12" cy="3.5" r="2" fill="#C4948A" />
      <circle cx="20.5" cy="12" r="2" fill="#9BAF93" />
      <circle cx="12" cy="20.5" r="2" fill="#C9A96E" />
      <circle cx="3.5" cy="12" r="2" fill="#9C8FBF" />
    </svg>
  ),
  upload: (p) => <Icon {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  clipboard: (p) => <Icon {...p} d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z" />,
  pill: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"
      stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M10.5 1.5l-8.5 8.5a5.66 5.66 0 008 8l8.5-8.5a5.66 5.66 0 00-8-8zM6.5 13.5l4-4" />
    </svg>
  ),

  // Sparkle (filled, not stroked)
  sparkle: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill={p.color||'#C4948A'} stroke="none" style={p.style}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  ),

  // Logo mark
  logo: (p) => (
    <svg width={p.size||24} height={p.size||24} viewBox="0 0 40 40" style={p.style}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4948A" />
          <stop offset="100%" stopColor="#9BAF93" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
      <path d="M20 8 A12 12 0 0 1 20 32" fill="white" opacity="0.9" />
      <circle cx="20" cy="20" r="5" fill="white" opacity="0.5" />
    </svg>
  ),
}

// Phase-specific icon (colored circle with ring)
export function PhaseIcon({ color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}20`, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: size * 0.25, height: size * 0.25, borderRadius: '50%',
        background: color,
      }} />
    </div>
  )
}

// Insight type icon mapping
export const insightTypeIcons = {
  sleep: Icons.moon,
  recovery: Icons.shield,
  cycle: Icons.refresh,
  nutrition: Icons.droplet,
  activity: Icons.activity,
  temperature: Icons.thermometer,
}

export const insightTypeColors = {
  sleep: '#6B7DB3', recovery: '#9BAF93', cycle: '#C4948A',
  nutrition: '#C9A96E', activity: '#7AA38F', temperature: '#B07A6E',
}