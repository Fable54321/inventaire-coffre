import { Outlet } from "react-router-dom"



function App() {



  return (
    <article className="flex flex-col items-center font-secondary w-full">
     
      <h1 className="mt-10 font-primary text-center  rounded-lg text-black text-[3em] font-bold">  
Inventario de cajas de herramientas</h1>

      <Outlet />
    </article>
  )
}

export default App
