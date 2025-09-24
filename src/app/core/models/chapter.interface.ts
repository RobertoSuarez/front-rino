/**
 * Interfaz para el modelo de capítulo
 */
export interface Chapter {
  id: number;
  title: string;
  shortDescription: string;
  index: number;
  difficulty: string;
  courseId?: number;
  course?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterWithProgress {

  id: number;
  title: string;
  shortDescription: string;
  progress: number;
  started: boolean;
  nextToStart: boolean;
  index: number;
}
  

/**
 * Interfaz para la respuesta de la API al obtener capítulos
 */
export interface ApiChapterResponse {
  data: Chapter[];
  message: string;
  statusCode: number;
}

/**
 * Interfaz para la respuesta de la API al obtener un capítulo por ID
 */
export interface GetChapterByIdResponse {
  data: Chapter;
  message: string;
  statusCode: number;
}

/**
 * Interfaz para crear un capítulo
 */
export interface CreateChapterRequest {
  courseId: number;
  title: string;
  shortDescription: string;
  difficulty: string;
}

/**
 * Interfaz para actualizar un capítulo
 */
export interface UpdateChapterRequest {
  title?: string;
  shortDescription?: string;
  difficulty?: string;
}
