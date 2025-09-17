/**
 * Interfaz para el modelo de tema
 */
export interface Tema {
  id: number;
  title: string;
  difficulty: string;
  createdAt: string;
  updatedAt?: string;
  // Campos opcionales que podrían estar disponibles en operaciones específicas
  shortDescription?: string;
  theory?: string;
  urlBackground?: string;
  index?: number;
  chapterId?: number;
  chapter?: any;
}

/**
 * Interfaz para la respuesta de la API al obtener temas
 */
export interface ApiTemaResponse {
  data: Tema[];
  message: string;
  statusCode: number;
}

/**
 * Interfaz para la respuesta de la API al obtener un tema por ID
 */
export interface GetTemaByIdResponse {
  data: Tema;
  message: string;
  statusCode: number;
}

/**
 * Interfaz para crear un tema
 */
export interface CreateTemaRequest {
  title: string;
  shortDescription: string;
  theory: string;
  urlBackground?: string;
  difficulty: string;
  chapterId: number;
}

/**
 * Interfaz para actualizar un tema
 */
export interface UpdateTemaRequest {
  title?: string;
  shortDescription?: string;
  theory?: string;
  urlBackground?: string;
  difficulty?: string;
}


export interface ActividadConProgreso {
  id: number;
  title: string;
  started: boolean;
  progress: number;
  completed: boolean;
}

export interface TemaConProgreso {
  id: number;
  title: string;
  shortDescription: string;
  urlBackground: string;
  index: number;
  completedActivities: number;
  activitiesToComplete: number;
  nextToStart: boolean,
  activities: ActividadConProgreso[];
}