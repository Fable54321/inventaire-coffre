import { ChevronRight, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useVehicles } from "../Contexts/VehiclesContext/UseVehicles";

const VehiclesList = () => {
  const { vehicles, vehicleCheckSummaryById, loading, error } = useVehicles();

  return (
    <div className="w-full">
      <div className="relative w-[min(750px,99%)] mx-auto my-4">
        <div className="h-0.5 w-20 bg-linear-to-l from-primary to-transparent absolute left-5 top-1/2 -translate-y-1/2"></div>
        <div className="h-0.5 w-20 bg-linear-to-r from-primary to-transparent absolute right-5 top-1/2 -translate-y-1/2"></div>
        <h2 className="font-bold font-[inter] text-[2em] text-secondary text-center">Lista de vehiculos</h2>
      </div>

      {loading && <p className="text-center">Cargando...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      <ul className="flex flex-col gap-2 mt-5 w-[min(750px,98%)] mx-auto mb-5">
        {[...vehicles]
          .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
          .map((vehicle) => (
            <li key={vehicle.id}>
              <div
                className="flex flex-col gap-3 items-center bg-[#f4fdf1] rounded-lg p-4 relative"
                style={{ boxShadow: "-2px 2px 24px 0px rgba(0,0,0,0.4)" }}
              >
                <div className="flex gap-10 items-center justify-between w-[90%]">
                  <div className="p-3 rounded-lg bg-primary text-white">
                    <Truck size={34} />
                  </div>
                  <p className="font-bold text-secondary text-[2.5em] border-2 border-secondary/50 border-t-0 border-b-0 px-7 leading-none">
                    Vehiculo: {vehicle.code}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="text-[1.2em]">Usado por :</p>
                    <Link
                      to={`/vehiculos/${vehicle.id}`}
                      className="text-[2em] inline font-bold underline decoration-secondary/40 underline-offset-4"
                    >
                      {vehicle.name}
                    </Link>
                  </div>
                </div>

                <div className="flex justify-around w-full">
                  {vehicle.inventory_done && (
                    <Link
                      to={`/vehiculos/${vehicle.id}/verification`}
                      className="flex items-center text-[1.1em] underline font-semibold text-secondary"
                    >
                      Ultima revision: {vehicle.verified_at ? vehicle.verified_at.slice(0, 10) : "-"}
                      <ChevronRight className="text-secondary" strokeWidth={3} size={18} />
                    </Link>
                  )}
                  <p className="text-[1.1em] font-semibold text-secondary">
                    Herramientas verificadas:{" "}
                    {vehicleCheckSummaryById[vehicle.id]
                      ? `${vehicleCheckSummaryById[vehicle.id].checked} / ${vehicleCheckSummaryById[vehicle.id].total}`
                      : "-"}
                  </p>
                </div>

                <ChevronRight className="text-secondary absolute right-4 top-1/2 transform -translate-y-1/2" strokeWidth={3} />
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default VehiclesList;
