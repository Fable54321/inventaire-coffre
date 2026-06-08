import { useEffect } from "react";
import { BriefcaseBusiness, Truck } from "lucide-react";
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
      <h1 className="mt-10 font-primary text-center rounded-lg text-black text-[clamp(2.1rem,5vw,2.9em)] font-bold">
        Inventario de cajas de herramientas
      </h1>
      <nav className="mt-5 flex rounded-lg border border-secondary/20 bg-white p-1 shadow-md">
        <NavLink
          to="/cajas"
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-2 rounded-md px-4 text-[1.05em] font-bold transition-colors ${
              isActive
                ? "bg-secondary text-white shadow-sm"
                : "text-secondary hover:bg-tertiary"
            }`
          }
        >
          <BriefcaseBusiness size={20} strokeWidth={2.5} />
          <span>Cajas</span>
        </NavLink>
        <NavLink
          to="/vehiculos"
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-2 rounded-md px-4 text-[1.05em] font-bold transition-colors ${
              isActive
                ? "bg-secondary text-white shadow-sm"
                : "text-secondary hover:bg-tertiary"
            }`
          }
        >
          <Truck size={21} strokeWidth={2.5} />
          <span>Vehiculos y otros</span>
        </NavLink>
      </nav>
      <Outlet />
    </article>
  );
}

export default App;
