import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import Bloodwork from './pages/Bloodwork'
import PhaseDetail from './pages/PhaseDetail'
import UHTest from './pages/UHTest'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/bloodwork" element={<Bloodwork />} />
        <Route path="/phase" element={<PhaseDetail />} />
        <Route path="/phase/:phaseKey" element={<PhaseDetail />} />
        <Route path="/uhtest" element={<UHTest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
