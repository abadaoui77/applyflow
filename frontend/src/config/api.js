function readApiUrl(value, name) {
  if (!value?.trim()) {
    throw new Error(
      `${name} est manquante. Configurez frontend/.env.local puis redémarrez Vite.`
    );
  }

  const baseUrl = value.trim().replace(/\/+$/, "");
  const parsedUrl = new URL(baseUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol) || parsedUrl.search || parsedUrl.hash) {
    throw new Error(`${name} doit être une URL HTTP ou HTTPS sans paramètres ni fragment.`);
  }

  return baseUrl;
}

export const AUTH_API_URL = readApiUrl(
  import.meta.env.VITE_AUTH_API_URL,
  "VITE_AUTH_API_URL"
);

export const APPLICATION_API_URL = readApiUrl(
  import.meta.env.VITE_APPLICATION_API_URL,
  "VITE_APPLICATION_API_URL"
);
