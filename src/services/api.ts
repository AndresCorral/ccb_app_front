import axios, { AxiosError } from "axios";
import { LoginCredentials, Task } from "../types";

const API_URL = "https://ccbtodoapp-production.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Cambia a true solo si necesitas enviar cookies
});

// Interceptor para incluir el token en cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error("No autorizado. Verifica tu sesión.");
        throw new Error("No autorizado. Por favor, inicia sesión.");
      }

      if (status === 422) {
        console.error("Entrada inválida.");
        throw new Error("Entrada inválida. Revisa los datos proporcionados.");
      }

      if (status >= 500) {
        console.error("Error del servidor.");
        throw new Error("Error interno del servidor. Intenta más tarde.");
      }
    }

    if (error.code === "ERR_NETWORK") {
      console.error("Error de red.");
      throw new Error("No se pudo conectar con el servidor.");
    }

    throw error;
  }
);

// Función auxiliar para manejar solicitudes
const handleApiCall = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }
    throw new Error("Error desconocido.");
  }
};

// Endpoints
export const login = async (credentials: LoginCredentials) => {
  return handleApiCall(async () => {
    const response = await api.post<{
      access_token: string;
      token_type: string;
      user_id: string;
    }>("/auth/login", credentials);
    return response.data;
  });
};

export const getTasksByUser = async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    throw new Error("No se encontró el ID del usuario.");
  }
  const response = await api.get(`/tasks/user/${userId}`);
  return response.data;
};

export const createTask = async (task: Omit<Task, "id">): Promise<Task> => {
  return handleApiCall(async () => {
    const response = await api.post<Task>("/tasks/", task);
    return response.data;
  });
};

export const updateTask = async (
  id: string,
  task: Partial<Task>
): Promise<Task> => {
  return handleApiCall(async () => {
    const response = await api.patch<Task>(`/tasks/${id}`, task);
    return response.data;
  });
};

export const updateTaskStatus = async (
  id: string,
  status: Task["task_status"]
): Promise<Task> => {
  return handleApiCall(async () => {
    const response = await api.patch<Task>(`/tasks/${id}/status`, {
      task_status: status,
    });
    return response.data;
  });
};

export const deleteTask = async (id: string): Promise<void> => {
  return handleApiCall(async () => {
    await api.delete(`/tasks/${id}`);
  });
};
