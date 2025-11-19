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
import { hydraService } from "./services/hydraService";

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

  // Automatic permission change detection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          // Get SDK instance for direct access
          const sdk = hydraService.getSDK();
          if (!sdk) return;
          
          // Check if permission has changed
          const hasChanged = sdk.hasNotificationPermissionChanged();
          
          if (hasChanged) {
            const currentPermission = 'Notification' in window ? Notification.permission : 'denied';
            console.log('🔔 Notification permission changed! Current:', currentPermission);
            
            // Handle the permission change automatically
            const newState = await sdk.handleNotificationPermissionChange();
            
            if (newState) {
              console.log('✅ Notification state updated:', newState);
            }
          }
        } catch (error) {
          console.error('Error handling permission change:', error);
        }
      }
    };

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check on window focus
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

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
