import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import NewWorkflow from '@/pages/NewWorkflow';
import WorkflowDetail from '@/pages/WorkflowDetail';
import RunDetail from '@/pages/RunDetail';
import Templates from '@/pages/Templates';
import Contacts from '@/pages/Contacts';
import Calendar from '@/pages/Calendar';
import MyStatus from '@/pages/MyStatus';
import Assistant from '@/pages/Assistant';
import LogoDesigner from '@/pages/LogoDesigner';
import WebsiteDesigner from '@/pages/WebsiteDesigner';
// Add page imports here

// Logged-out visitors on the home page see the marketing site (public/welcome.html);
// every other protected page sends them to the login screen.
const LoggedOutRedirect = () => {
  const { pathname } = useLocation();
  if (pathname === '/') {
    window.location.replace('/welcome.html');
    return null;
  }
  return <Navigate to="/login" replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<LoggedOutRedirect />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/workflows/new" element={<NewWorkflow />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/my-status" element={<MyStatus />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/logo-designer" element={<LogoDesigner />} />
          <Route path="/website-designer" element={<WebsiteDesigner />} />
          <Route path="/workflows/:id" element={<WorkflowDetail />} />
          <Route path="/runs/:id" element={<RunDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App