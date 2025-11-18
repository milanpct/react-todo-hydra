import React from "react";
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
