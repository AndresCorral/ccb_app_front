import axios from "axios";
import { LoginCredentials, Task } from "../types";

const API_URL = "https://ccbtodoapp-production.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Maneja errores específicos de la API
      if (error.response?.status === 401) {
        throw new Error("Credenciales incorrectas");
      }
      if (error.response?.status === 422) {
        throw new Error("Datos de entrada inválidos");
      }
      // Maneja errores de red
      if (error.code === "ERR_NETWORK") {
        throw new Error("Error de conexión con el servidor");
      }
    }
    // Lanza el error original si no es un error de Axios
    throw error;
  }
};

export const getTasks = async () => {
  const response = await api.get("/tasks/");
  return response.data;
};

export const createTask = async (task: Omit<Task, "id">) => {
  const response = await api.post("/tasks/", task);
  return response.data;
};

export const updateTask = async (id: string, task: Partial<Task>) => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const updateTaskStatus = async (
  id: string,
  status: Task["task_status"]
) => {
  const response = await api.patch(`/tasks/${id}`, { task_status: status });
  return response.data;
};

export const deleteTask = async (id: string) => {
  await api.delete(`/tasks/${id}`);
};
