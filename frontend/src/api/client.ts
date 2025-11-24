// src/api/client.ts

export const BACKEND_URL = import.meta.env.NEURO_API_BASE_URL ?? "http://localhost:8000";
// export const BACKEND_URL = import.meta.env.NEURO_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function apiPost(path: string, body: unknown) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API ERROR: ${response.status}`);
  }

  return response.json();
}
