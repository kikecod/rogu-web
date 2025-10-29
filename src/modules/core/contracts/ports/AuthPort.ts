// Auth Port - Interface for authentication operations
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  // Persona data
  nombres: string;
  paterno: string;
  materno: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
  // Usuario data
  usuario: string;
  correo: string;
  contrasena: string;
}

export interface AuthResult {
  token: string;
  user: {
    correo: string;
    usuario: string;
    idPersona: number;
    idUsuario: number;
    roles: string[];
    avatar?: string;
  };
}

export interface AuthPort {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthResult['user'] | null>;
  refreshToken?(): Promise<string>;
}
