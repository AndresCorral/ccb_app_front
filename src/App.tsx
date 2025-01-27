import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { LoginForm } from "./components/LoginForm";
import { TaskList } from "./components/TaskList";
import { useAuth } from "./context/AuthContext";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/tasks" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="auth/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TaskList />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
