import { ChevronRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { useVehicles } from "../Contexts/VehiclesContext/UseVehicles";

const VehiclesList = () => {
  const { vehicles, vehicleCheckSummaryById, loading, error } = useVehicles();

  return (
    <div className="w-full">
      <div className="relative w-[min(750px,99%)] mx-auto my-4 px-3">
        <div className="h-0.5 w-20 bg-linear-to-l from-primary to-transparent absolute left-5 top-1/2 -translate-y-1/2 max-[600px]:hidden"></div>
        <div className="h-0.5 w-20 bg-linear-to-r from-primary to-transparent absolute right-5 top-1/2 -translate-y-1/2 max-[600px]:hidden"></div>
        <h2 className="font-bold font-[inter] text-[clamp(1.45rem,6vw,2em)] text-secondary text-center">Lista de equipos</h2>
      </div>

      {loading && <p className="text-center">Cargando...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      <ul className="flex flex-col gap-2 mt-5 w-[min(750px,calc(100%-1rem))] mx-auto mb-5">
        {[...vehicles]
          .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
          .map((vehicle) => (
            <li key={vehicle.id}>
              <div
                className="flex flex-col gap-3 items-center bg-[#f4fdf1] rounded-lg p-4 pr-11 relative max-[600px]:items-stretch max-[600px]:p-3 max-[600px]:pr-9"
                style={{ boxShadow: "-2px 2px 24px 0px rgba(0,0,0,0.4)" }}
              >
                <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_minmax(8rem,auto)] items-center gap-5 max-[600px]:grid-cols-[auto_minmax(0,1fr)] max-[600px]:gap-3">
                  <div className="p-3 rounded-lg bg-primary text-white justify-self-start">
                    <ClipboardList size={34} />
                  </div>
                  <p className="min-w-0 font-bold text-secondary text-[clamp(1.65rem,8vw,2.5em)] border-2 border-secondary/50 border-t-0 border-b-0 px-5 leading-none max-[600px]:px-3">
                    {vehicle.code}
                  </p>
                 <div className="flex min-w-0 flex-col gap-1 max-[600px]:col-span-2 max-[600px]:pl-1">
                  {vehicle.name && (
                    <>
                    <p className="text-[clamp(1rem,4vw,1.2em)]">Usado por :</p>
                    <Link
                      to={`/vehiculos/${vehicle.id}`}
                      className="text-[clamp(1.35rem,6vw,2em)] inline font-bold underline decoration-secondary/40 underline-offset-4 wrap-break-word leading-tight"
                    >
                      {vehicle.name}
                    </Link>
                    </>
                  )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-around gap-x-5 gap-y-2 w-full text-center max-[600px]:justify-start max-[600px]:text-left">
                  {vehicle.inventory_done && (
                    <Link
                      to={`/vehiculos/${vehicle.id}/verification`}
                      className="flex items-center text-[clamp(0.95rem,3.5vw,1.1em)] underline font-semibold text-secondary"
                    >
                      Ultima revision: {vehicle.verified_at ? vehicle.verified_at.slice(0, 10) : "-"}
                      <ChevronRight className="text-secondary" strokeWidth={3} size={18} />
                    </Link>
                  )}
                  <p className="text-[clamp(0.95rem,3.5vw,1.1em)] font-semibold text-secondary">
                    Herramientas verificadas:{" "}
                    {vehicleCheckSummaryById[vehicle.id]
                      ? `${vehicleCheckSummaryById[vehicle.id].checked} / ${vehicleCheckSummaryById[vehicle.id].total}`
                      : "-"}
                  </p>
                </div>


                    {!vehicle.name &&  <Link
                  to={`/vehiculos/${vehicle.id}`}
                  aria-label={`Abrir inventario de ${vehicle.name}`}
                  className="text-secondary absolute right-3 top-1/2 transform -translate-y-1/2 max-[600px]:top-4 max-[600px]:translate-y-0"
                >
                  <ChevronRight strokeWidth={3} size={50} />
                </Link>}

               {vehicle.name &&  <Link
                  to={`/vehiculos/${vehicle.id}`}
                  aria-label={`Abrir inventario de ${vehicle.name}`}
                  className="text-secondary absolute right-3 top-1/2 transform -translate-y-1/2 max-[600px]:top-4 max-[600px]:translate-y-0"
                >
                  <ChevronRight strokeWidth={3} />
                </Link>}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default VehiclesList;
