// Tipos para la autenticación
export interface LoginRequest {
  employeeCode: number;
  password: string;
}

export interface LoginResponse {
  token: string;
  salesPersonCode: number;
  fullName: string;
}

// Tipos genéricos para respuestas de API estándar (opcional, para uso futuro)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
