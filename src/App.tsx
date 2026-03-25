import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { LeadInbox } from './pages/LeadInbox'
import { PipelineTracker } from './pages/PipelineTracker'
import { ReferralPartners } from './pages/ReferralPartners'
import { PastClientReactivation } from './pages/PastClientReactivation'
import { ContactDetail } from './pages/ContactDetail'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<LeadInbox />} />
          <Route path="/pipeline" element={<PipelineTracker />} />
          <Route path="/partners" element={<ReferralPartners />} />
          <Route path="/reactivation" element={<PastClientReactivation />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
