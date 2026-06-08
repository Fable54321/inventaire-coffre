import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { usePersistentAuth } from "../Contexts/AuthContext/AuthContext";

function App() {
  const { user } = usePersistentAuth();

  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  return (
    <article className="flex flex-col items-center font-secondary w-full">
      <h1 className="mt-10 font-primary text-center rounded-lg text-black text-[2.9em] font-bold">
        Inventario de cajas de herramientas
      </h1>
      <div className="flex gap-2">
        <NavLink to="/cajas" className={({ isActive }) => `font-bold underline ${isActive ? "text-secondary" : ""}`}>
          Cajas
        </NavLink>
        <NavLink to="/vehiculos" className={({ isActive }) => `font-bold underline ${isActive ? "text-secondary" : ""}`}>
          Vehiculos
        </NavLink>
      </div>
      <Outlet />
    </article>
  );
}

export default App;
