import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TodoProvider } from "./contexts/TodoContext";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LoadTesting from "./pages/LoadTesting";

function AppContent() {
  const { user } = useAuth();

  // FCM notification listener - logs to console
  useEffect(() => {
    const handleFCMNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const payload = customEvent.detail;
      
      console.group('🔔 FCM Notification Received');
      console.log('Timestamp:', new Date().toLocaleTimeString());
      console.log('Notification Data:', payload);
      if (payload.notification) {
        console.log('Title:', payload.notification.title);
        console.log('Body:', payload.notification.body);
      }
      if (payload.data) {
        console.log('Custom Data:', payload.data);
      }
      console.groupEnd();
    };

    // Listen for FCM messages from SDK
    window.addEventListener('hydra-fcm-message', handleFCMNotification);

    return () => {
      window.removeEventListener('hydra-fcm-message', handleFCMNotification);
    };
  }, []);

  // Remote Config is now automatically logged by SDK when initialized
  // No need to manually fetch or log here

  // Note: Automatic permission change detection is now handled internally by the SDK
  // The SDK automatically listens for visibility/focus changes and handles permission updates

  return (
    <Layout>
      <Routes>
        {/* ✅ ALLOW ANONYMOUS ACCESS TO DASHBOARD */}
        <Route
          path="/"
          element={
            <TodoProvider>
              <Dashboard />
            </TodoProvider>
          }
        />
        {/* ✅ REDIRECT AUTHENTICATED USERS AWAY FROM AUTH PAGE */}
        <Route
          path="/auth"
          element={!user ? <Auth /> : <Navigate to="/" replace />}
        />
        <Route path="/load-testing" element={<LoadTesting />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
