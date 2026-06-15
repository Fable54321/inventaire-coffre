import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useVehicles } from "../Contexts/VehiclesContext/UseVehicles";
import SinglePicture from "../170--ToolboxPictures/SinglePicture";

const VehiclePictures = () => {
  const { vehicleId, pictureId } = useParams();
  const navigate = useNavigate();
  const {
    vehicles,
    vehiclePictures,
    vehiclePicturesLoading,
    vehiclePicturesError,
    fetchVehiclePictures,
    fetchSingleVehiclePicture,
    selectedVehiclePicture,
    selectedVehiclePictureLoading,
    selectedVehiclePictureError,
  } = useVehicles();

  useEffect(() => {
    if (vehicleId) {
      fetchVehiclePictures(Number(vehicleId)).catch(() => {
        // error is handled by context state
      });
    }
  }, [fetchVehiclePictures, vehicleId]);

  useEffect(() => {
    if (vehicleId && pictureId) {
      fetchSingleVehiclePicture(Number(vehicleId), Number(pictureId)).catch(() => {
        // error is handled by context state
      });
    }
  }, [fetchSingleVehiclePicture, vehicleId, pictureId]);

  const selectedVehicle = useMemo(() => {
    if (!vehicles || !vehicleId) return null;

    return vehicles.find((vehicle) => vehicle.id === Number(vehicleId));
  }, [vehicles, vehicleId]);

  return (
    <article className="flex w-full flex-col items-center">
      <h2>Fotos del equipo {selectedVehicle?.code}</h2>
      {vehiclePicturesLoading && <p className="mt-6 text-[1.3em] font-bold">Cargando fotos...</p>}
      {vehiclePicturesError && <p className="mt-6 text-center font-bold text-red-600">{vehiclePicturesError}</p>}
      {!vehiclePicturesLoading && !vehiclePicturesError && vehiclePictures.length === 0 && (
        <p className="mt-6 text-[1.2em] font-bold">No se encontraron fotos para este equipo.</p>
      )}

      <div className="mt-4 flex w-[min(750px,calc(100%-1rem))] flex-col items-center gap-2 gap-y-10 md:grid md:grid-cols-3">
        {vehiclePictures.map((picture) => (
          <Link
            to={`/vehiculos/${vehicleId}/pictures/${picture.id}`}
            key={picture.id}
            className="mx-auto mb-auto mt-0 rounded-xl border border-b border-black/10 bg-[#f4fdf1] shadow-2xl"
          >
            <div className="relative flex flex-col gap-3">
              <p className="flex min-h-20 max-w-[98%] flex-col justify-center text-center text-[1.1em] font-bold">
                {picture.description}
              </p>
              <img src={picture.signed_url} alt={picture.description || ""} />
            </div>
          </Link>
        ))}
      </div>

      {pictureId && (
        <SinglePicture
          picture={selectedVehiclePicture}
          loading={selectedVehiclePictureLoading}
          error={selectedVehiclePictureError}
          title={selectedVehiclePicture?.description || `Foto del equipo ${selectedVehicle?.code ?? ""}`}
          onClose={() => navigate(`/vehiculos/${vehicleId}/pictures`)}
        />
      )}
    </article>
  );
};

export default VehiclePictures;
