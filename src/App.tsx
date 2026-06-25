import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SalonListingPage } from './pages/SalonListingPage';
import { SalonDetailPage } from './pages/SalonDetailPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { AiRecommendationsPage } from './pages/AiRecommendationsPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { QrScannerPage } from './pages/QrScannerPage';
import { BecomePartnerPage } from './pages/BecomePartnerPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#F4F5ED] text-[#222017] flex flex-col font-sans" id="jalwaa-root">
          {/* Header Navigation */}
          <Navbar />

          {/* Main Pages Viewport */}
          <main className="flex-grow">
            <Routes>
              {/* Client Views */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/salons" element={<SalonListingPage />} />
              <Route path="/salon/:id" element={<SalonDetailPage />} />
              <Route path="/book/:id" element={<BookingFlowPage />} />
              <Route path="/booking-success/:id" element={<BookingSuccessPage />} />
              
              {/* AI Recommendations View */}
              <Route path="/ai-recommendations" element={<AiRecommendationsPage />} />
              
              {/* Dashboards */}
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
              
              {/* QR Scanner */}
              <Route path="/qr-scanner" element={<QrScannerPage />} />
              
              {/* Partnership */}
              <Route path="/partner" element={<BecomePartnerPage />} />

              {/* Wildcard catch redirecting to Landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer content */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
