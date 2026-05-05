import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './100--App/App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToolBoxesProvider } from './Contexts/ToolBoxesContext/ToolBoxesContextProvider'
import ToolBoxesList from './110--ToolBoxesList/ToolBoxesList'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <ToolBoxesList />,
      },
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToolBoxesProvider>
      <RouterProvider router={router} />
    </ToolBoxesProvider>
  </StrictMode>,
)
