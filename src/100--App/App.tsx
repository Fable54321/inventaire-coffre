import { Outlet } from "react-router-dom"



function App() {



  return (
    <article className="flex flex-col items-center font-secondary">
      <h1 className="mt-30 font-primary text-black text-[2em] font-bold">
Inventario de cajas de herramientas</h1>
      <Outlet />
    </article>
  )
}

export default App
