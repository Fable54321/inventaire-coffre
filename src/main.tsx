import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './100--App/App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToolBoxesProvider } from './Contexts/ToolBoxesContext/ToolBoxesContextProvider'
import ToolBoxesList from './110--ToolBoxesList/ToolBoxesList'
import ToolboxDetail from './120--ToolboxDetail/ToolboxDetail'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <ToolBoxesList />,
      },
      {
        path: "toolbox/:toolboxId",
        element: <ToolboxDetail />,
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
