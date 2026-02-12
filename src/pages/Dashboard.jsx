export default function Dashboard() {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center px-6">
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
  
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-6"
          style={{ background: 'linear-gradient(135deg, #E8A0BF, #C4E0A5)' }}
        >
          ✓
        </div>
  
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#2D2A3E',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          You're all set!
        </h1>
  
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: '#888',
            textAlign: 'center',
            maxWidth: 350,
            lineHeight: 1.6,
          }}
        >
          Your profile is ready. The dashboard and daily check-in are coming next.
        </p>
      </div>
    )
  }