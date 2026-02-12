import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #E8A0BF 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #C4E0A5 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #B8D4E8 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #E8A0BF, #C4E0A5)' }}
          >
            ◐
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-center mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 6vw, 3.2rem)',
            fontWeight: 800,
            color: '#2D2A3E',
            lineHeight: 1.15,
            maxWidth: 500,
          }}
        >
          Your health,
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #c06090, #8ab060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            in sync
          </span>
        </h1>

        <p
          className="text-center mb-10"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            color: '#777',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          Connect your wearable data, bloodwork, and daily check-ins — all analyzed through your cycle.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="group relative cursor-pointer"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: 'white',
            background: 'linear-gradient(135deg, #2D2A3E, #3d3856)',
            border: 'none',
            borderRadius: 50,
            padding: '16px 48px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(45, 42, 62, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 30px rgba(45, 42, 62, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 20px rgba(45, 42, 62, 0.2)'
          }}
        >
          Get Started
        </button>

        {/* Already have account */}
        <button
          className="mt-4 cursor-pointer"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: '#aaa',
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#2D2A3E')}
          onMouseLeave={(e) => (e.target.style.color = '#aaa')}
        >
          I already have an account
        </button>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 max-w-md">
          {[
            { icon: '📋', label: 'Daily Check-ins' },
            { icon: '🩸', label: 'Bloodwork Analysis' },
            { icon: '⌚', label: 'Oura Integration' },
            { icon: '💊', label: 'Supplement Tracking' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: '#888',
                background: 'white',
                border: '1px solid #e8e6e1',
                borderRadius: 30,
                padding: '8px 16px',
              }}
            >
              <span>{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 text-center py-6"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: '#ccc',
        }}
      >
        Cycle Sync — Built by Vendela
      </div>
    </div>
  )
}
