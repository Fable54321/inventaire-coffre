import { Outlet } from "react-router-dom"
import { usePersistentAuth } from "../Contexts/AuthContext/AuthContext";
import { useEffect } from "react";



function App() {


  const { user, } = usePersistentAuth();


  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  return (
    <article className="flex flex-col items-center font-secondary w-full">
     
      <h1 className="mt-10 font-primary text-center  rounded-lg text-black text-[2.9em] font-bold">  
Inventario de cajas de herramientas</h1>

      <Outlet />
    </article>
  )
}

export default App
