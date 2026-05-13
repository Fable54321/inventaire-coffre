import { usePersistentAuth } from "../Contexts/AuthContext/AuthContext";
import { useEffect } from "react";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = usePersistentAuth();

  const hasAccess = !!user?.appAccess?.some((app) => app.slug === "toolbox");

  useEffect(() => {
    if (loading) return;

    // if (!user || !hasAccess) {
    //   alert("Vous n'avez pas les permissions nécessaires pour accéder à cette application.");
    //   window.location.replace("https://vegibec-portail.com/");
    //   return;
    // }

    
  }, [user, loading, hasAccess]);

  if (loading) return <div>Chargement...</div>;

  if (!user || !hasAccess) return null;

  return children;
};



export default ProtectedRoute;