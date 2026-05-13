import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './100--App/App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToolBoxesProvider } from './Contexts/ToolBoxesContext/ToolBoxesContextProvider'
import ToolBoxesList from './110--ToolBoxesList/ToolBoxesList'
import ToolboxDetail from './120--ToolboxDetail/ToolboxDetail'
import LastVerification from './130--LastVerification/LastVerification'
import ProtectedRoute from './Components/ProtectedRoute'
import { PersistentAuthProvider } from './Contexts/AuthContext/AuthContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
    </ProtectedRoute>
  ),
    children: [
      {
        path: "/",
        element:( 
        <ProtectedRoute>
        <ToolBoxesList />
        </ProtectedRoute>
      ),
      },
      {
        path: "toolbox/:toolboxId",
        element:( 
          <ProtectedRoute>
        <ToolboxDetail />
        </ProtectedRoute>
        ),
      },
    ]
  },
  {
    path: "/verification/:toolboxId",
    element: (
      <ProtectedRoute>
    <LastVerification />
    </ProtectedRoute>
  )
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistentAuthProvider>
    <ToolBoxesProvider>
      <RouterProvider router={router} />
    </ToolBoxesProvider>
    </PersistentAuthProvider>
  </StrictMode>,
)
