import { useNavigate } from 'react-router-dom'
import { Icons } from './icons'

export default function Welcome() {
  const navigate = useNavigate()

  const features = [
    { icon: Icons.clipboard, label: 'Daily Check-ins' },
    { icon: Icons.flask, label: 'Bloodwork Analysis' },
    { icon: Icons.ring, label: 'Wearable Data' },
    { icon: Icons.pill, label: 'Supplement Tracking' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F6F4F0' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-up { animation: fadeUp 0.8s ease forwards; opacity: 0; }
        .fade-up-d1 { animation-delay: 0.1s; }
        .fade-up-d2 { animation-delay: 0.25s; }
        .fade-up-d3 { animation-delay: 0.4s; }
        .fade-up-d4 { animation-delay: 0.55s; }
        .fade-in { animation: fadeIn 1s ease forwards; opacity: 0; }
        .scale-in { animation: scaleIn 0.6s ease forwards; opacity: 0; }
      `}</style>

      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none fade-in">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #9BAF93 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #C4948A 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 scale-in">
          <Icons.logo size={48} />
        </div>

        {/* Headline */}
        <h1 className="text-center mb-4 fade-up fade-up-d1" style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
          fontWeight: 400, color: '#2C2825',
          lineHeight: 1.12, maxWidth: 440,
        }}>
          Your health,<br />
          <span style={{ fontStyle: 'italic', color: '#9BAF93' }}>in sync.</span>
        </h1>

        <p className="text-center mb-10 fade-up fade-up-d2" style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
          color: '#A09A90', maxWidth: 360, lineHeight: 1.65,
        }}>
          Connect your wearable data, bloodwork, and daily check-ins — all analyzed through your cycle.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="cursor-pointer fade-up fade-up-d3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 600, color: '#FFFEF9',
            background: '#2C2825', border: 'none', borderRadius: 12,
            padding: '16px 48px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(44, 40, 37, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 30px rgba(44, 40, 37, 0.22)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 20px rgba(44, 40, 37, 0.15)'
          }}
        >
          Get Started
        </button>

        {/* Already have account */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 cursor-pointer fade-up fade-up-d3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: '#A09A90',
            background: 'none', border: 'none',
            padding: '8px 16px', transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#2C2825')}
          onMouseLeave={(e) => (e.target.style.color = '#A09A90')}
        >
          I already have an account
        </button>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 max-w-md fade-up fade-up-d4">
          {features.map((feature) => {
            const FeatureIcon = feature.icon
            return (
              <div key={feature.label} className="flex items-center gap-2" style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, color: '#A09A90',
                background: '#FFFEF9', border: '1px solid #E8E4DD',
                borderRadius: 30, padding: '7px 14px',
              }}>
                <FeatureIcon size={13} color="#A09A90" />
                <span>{feature.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-6" style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11, color: '#C8C3BA',
      }}>
        Cycle Sync · Editorial Wellness
      </div>
    </div>
  )
}
