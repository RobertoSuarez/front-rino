/**
 * Interfaz genérica para las respuestas de la API
 * @template T - Tipo de datos que contiene la respuesta
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
