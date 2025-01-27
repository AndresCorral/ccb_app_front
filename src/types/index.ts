export interface Task {
  id: string;
  task_name: string;
  task_description: string;
  task_status: 'Pendiente' | 'Terminada' | 'Cancelada';
  user_id: string;
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}