const API_BASE_URL = import.meta.env.VITE_API_URL || "";

type FetchWithAuthOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
};

export async function fetchWithAuth<T>(
  path: string,
  options: FetchWithAuthOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  let serializedBody: BodyInit | null | undefined;

  const body = options.body;

  const isPlainObject =
    body != null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof ReadableStream);

  if (isPlainObject) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    serializedBody = JSON.stringify(body);
  } else {
    serializedBody = body as BodyInit | null | undefined;
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
    body: serializedBody,
  });

  if (!response.ok) {
    const requestMethod = options.method?.toString().toUpperCase() || "GET";
    const requestRoute = url;

    let errorMessage = `HTTP error ${response.status} (${requestMethod} ${requestRoute})`;

    try {
      const data = await response.json();
      const userMessage = data.error || data.message;

      if (userMessage) {
        errorMessage = `${userMessage} (${requestMethod} ${requestRoute})`;
      }
    } catch {
      const text = await response.text();

      if (text) {
        errorMessage = `${text} (${requestMethod} ${requestRoute})`;
      }
    }

    if (response.status === 401) {
      throw new Error(
        `Sesión expirada, por favor reconéctese. (${requestMethod} ${requestRoute})`,
      );
    }

    if (response.status === 403) {
      throw new Error(
        `Acceso denegado: no tiene los permisos necesarios. (${requestMethod} ${requestRoute})`,
      );
    }

    if (response.status === 500) {
      throw new Error(
        `Error del servidor, por favor inténtelo de nuevo más tarde. (${requestMethod} ${requestRoute})`,
      );
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return null as T;
}