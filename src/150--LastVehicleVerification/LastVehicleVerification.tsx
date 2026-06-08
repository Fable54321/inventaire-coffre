import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useVehicles } from "../Contexts/VehiclesContext/UseVehicles";

const LastVehicleVerification = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const {
    fetchVehicleVerification,
    currentVehicleVerification,
    vehicles,
    vehicleVerificationLoading,
  } = useVehicles();

  const currentVehicle = vehicles.find((vehicle) => vehicle.id === Number(vehicleId));

  useEffect(() => {
    if (vehicleId) {
      void fetchVehicleVerification(Number(vehicleId));
    }
  }, [fetchVehicleVerification, vehicleId]);

  return (
    <article className="flex flex-col items-center mt-20 gap-4 bg-white py-8 shadow-2xl rounded-xl w-[min(650px,99%)] mx-auto my-4">
      {currentVehicle && (
        <div>
          <h2 className="font-bold font-[inter] text-[2em] text-secondary text-center">
            Ultima revision del vehiculo: {currentVehicle.code}
          </h2>
          <h2 className="font-bold font-[inter] text-[2em] text-secondary text-center">
            usado por: {currentVehicle.name}
          </h2>
        </div>
      )}
      {vehicleVerificationLoading && <p>Cargando...</p>}
      {currentVehicleVerification && (
        <>
          <p className="text-[1.7em]">Verificado el: {currentVehicleVerification.verified_at?.slice(0, 10)}</p>
          <p className="text-[1.7em]">
            herramientas totales: {currentVehicleVerification.checked_items} / {currentVehicleVerification.total_items}
          </p>
          {currentVehicleVerification.signature_url && (
            <img className="bg-white border border-gray-400" src={currentVehicleVerification.signature_url} alt="signature" />
          )}
        </>
      )}
    </article>
  );
};

export default LastVehicleVerification;
