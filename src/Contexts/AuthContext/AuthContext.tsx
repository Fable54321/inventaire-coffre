import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

type AppAccess = {
  slug: string;
  role: string;
};

type User = {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  surname: string | null;
  full_name: string;
  appAccess: AppAccess[];
};

type PersistentAuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  checkAuth: () => Promise<boolean>;
  createPersistentSession: () => Promise<boolean>;
  redirectToPortal: () => void;
};

const PersistentAuthContext =
  createContext<PersistentAuthContextValue | null>(null);

export const PersistentAuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectToPortal = () => {
    window.location.replace("https://vegibec-portail.com/");
  };



 const createPersistentSession = useCallback(async () => {
  try {
    setError(null);

    const res = await fetch(
      `${API_BASE_URL}/alternative-auth/create-toolbox-device-session`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!res.ok) {
      setError("Impossible de créer la session persistante");
      return false;
    }

    return true;
  } catch (err) {
    console.error("createPersistentSession error:", err);
    setError("Erreur lors de la création de la session persistante");
    return false;
  }
}, []);


const checkAuth = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    let res = await fetch(`${API_BASE_URL}/alternative-auth/persistent/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const sessionCreated = await createPersistentSession();

      if (!sessionCreated) {
        setUser(null);
        return false;
      }

      res = await fetch(`${API_BASE_URL}/alternative-auth/persistent/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return false;
      }
    }

    const data = await res.json();
    setUser(data.user);

    await createPersistentSession();

    return true;
  } catch (err) {
    console.error("checkAuth error:", err);
    setUser(null);
    setError("Erreur lors de la vérification de la session");
    return false;
  } finally {
    setLoading(false);
  }
}, [createPersistentSession]);

 useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void checkAuth();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [checkAuth]);

  return (
    <PersistentAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        error,
        checkAuth,
        createPersistentSession,
        redirectToPortal,
      }}
    >
      {children}
    </PersistentAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePersistentAuth = () => {
  const context = useContext(PersistentAuthContext);

  if (!context) {
    throw new Error(
      "usePersistentAuth must be used inside PersistentAuthProvider",
    );
  }

  return context;
};
