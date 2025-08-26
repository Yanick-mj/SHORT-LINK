import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import AppLayout from './layout/app-layout.jsx';
import Lading from './pages/lading.jsx';
import Dashboard from './pages/dashboard.jsx';
import Auth from './pages/auth.jsx';
import Link from './pages/link.jsx';
import RedirectLink from './pages/redirect-link.jsx';
import AuthProvider from './pages/context.jsx';
import RequireAuth from './components/require-auth.jsx';


const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children:[
        {
          path: '/',
          element: <Lading />
        },
        {
          path: '/dashboard',
          element:
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
        },
        {
          path: '/auth',
          element: <Auth />
        },
        {
          path: '/link/:id',
          element:
            <RequireAuth>
              <Link/>
            </RequireAuth>
        },
        {
          path: '/:id',
          element: <RedirectLink/>
        },
      ]
    }
  ])

function App() {

  return (
    <AuthProvider>
      <RouterProvider router ={router}/>
    </AuthProvider>
  )
}

export default App
