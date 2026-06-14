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
      { path: 'dashboard', Component: Dashboard },
      { path: 'incidents/new', Component: NewIncident },
      { path: 'investigations', Component: Investigations },
      { path: 'investigations/:id', Component: InvestigationWorkspace },
      { path: 'settings', Component: Settings },
    ],
  },
]);
