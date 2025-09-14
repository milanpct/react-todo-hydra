import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user } = useAuth();

  return (
    <Layout>
      {user ? (
        <TodoProvider>
          <Dashboard />
        </TodoProvider>
      ) : (
        <Auth />
      )}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
