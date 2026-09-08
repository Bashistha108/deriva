import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = "http://localhost:8080/api/v1";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
