import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './100--App/App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToolBoxesProvider } from './Contexts/ToolBoxesContext/ToolBoxesContextProvider'
import { VehiclesProvider } from './Contexts/VehiclesContext/VehiclesContextProvider'
import ToolBoxesList from './110--ToolBoxesList/ToolBoxesList'
import VehiclesList from './140--VehiclesList/VehiclesList'
import ToolboxDetail from './120--ToolboxDetail/ToolboxDetail'
import LastVerification from './130--LastVerification/LastVerification'
import LastVehicleVerification from './150--LastVehicleVerification/LastVehicleVerification'
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
        index: true,
        element:( 
        <ProtectedRoute>
        <ToolBoxesList />
        </ProtectedRoute>
      ),
      },
      {
        path: "cajas",
        element:( 
        <ProtectedRoute>
        <ToolBoxesList />
        </ProtectedRoute>
      ),
      },
      {
        path: "vehiculos",
        element:( 
        <ProtectedRoute>
        <VehiclesList />
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
  },
  {
    path: "/vehiculos/:vehicleId/verification",
    element: (
      <ProtectedRoute>
    <LastVehicleVerification />
    </ProtectedRoute>
  )
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistentAuthProvider>
    <ToolBoxesProvider>
    <VehiclesProvider>
      <RouterProvider router={router} />
    </VehiclesProvider>
    </ToolBoxesProvider>
    </PersistentAuthProvider>
  </StrictMode>,
)
