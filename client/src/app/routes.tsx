import { createBrowserRouter, redirect } from 'react-router';
import Shell from './Shell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import NewIncident from './pages/NewIncident';
import Investigations from './pages/Investigations';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import Settings from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  {
    path: '/',
    Component: Shell,
    children: [
      { index: true, loader: () => redirect('/dashboard') },
      {
        path: 'dashboard',
        Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'incidents/new',
        Component: () => (
          <ProtectedRoute>
            <NewIncident />
          </ProtectedRoute>
        ),
      },
      {
        path: 'investigations',
        Component: () => (
          <ProtectedRoute>
            <Investigations />
          </ProtectedRoute>
        ),
      },
      {
        path: 'investigations/:id',
        Component: () => (
          <ProtectedRoute>
            <InvestigationWorkspace />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        Component: () => (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
