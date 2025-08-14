import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UsersPage from './pages/UsersPage'

import { OrderProvider } from './contexts/OrderContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
  return (
    <OrderProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>
                <Header />
                <main>
                  <HomePage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div>
                <Header />
                <main>
                  <SettingsPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <div>
                <Header />
                <main>
                  <UsersPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/subscription" element={
            <ProtectedRoute>
              <div>
                <Header />
                <main>
                  <SubscriptionPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </OrderProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
