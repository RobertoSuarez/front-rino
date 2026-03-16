import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;
  private assistantUrl = `${environment.apiUrl}/openai/course-assistant`;

  constructor(private http: HttpClient) { }

  /**
   * Genera una descripción para un curso utilizando IA
   * @param title Título del curso
   * @returns Observable con la descripción generada
   */
  generateCourseDescription(title: string): Observable<{ data: { description: string } }> {
    return this.http.post<{ data: { description: string } }>(`${this.apiUrl}/generate-course-description`, { title });
  }

  /**
   * Genera una descripción para un capítulo utilizando IA
   * @param chapterTitle Título del capítulo
   * @param courseTitle Título del curso
   * @param courseDescription Descripción del curso
   * @returns Observable con la descripción generada
   */
  generateChapterDescription(
    chapterTitle: string,
    courseTitle: string,
    courseDescription: string
  ): Observable<{ data: { description: string } }> {
    return this.http.post<{ data: { description: string } }>(`${this.apiUrl}/generate-chapter-description`, {
      chapterTitle,
      courseTitle,
      courseDescription
    });
  }

  /**
   * Genera contenido para un tema utilizando IA
   * @param temaTitle Título del tema
   * @param chapterTitle Título del capítulo
   * @param courseTitle Título del curso
   * @returns Observable con el contenido generado (descripción corta y teoría)
   */
  generateTemaContent(
    temaTitle: string,
    chapterTitle: string,
    courseTitle: string
  ): Observable<{ data: { shortDescription: string, theory: string } }> {
    return this.http.post<{ data: { shortDescription: string, theory: string } }>(`${this.apiUrl}/generate-tema-content`, {
      temaTitle,
      chapterTitle,
      courseTitle
    });
  }

  /**
   * Genera teoría para un tema con un prompt personalizado
   * @param prompt Prompt personalizado del usuario
   * @param temaTitle Título del tema
   * @param chapterTitle Título del capítulo
   * @param courseTitle Título del curso
   * @returns Observable con la teoría generada en HTML
   */
  generateTheoryWithPrompt(
    prompt: string,
    temaTitle: string,
    chapterTitle: string,
    courseTitle: string
  ): Observable<{ data: { theory: string } }> {
    return this.http.post<{ data: { theory: string } }>(`${this.apiUrl}/generate-theory-with-prompt`, {
      prompt,
      temaTitle,
      chapterTitle,
      courseTitle
    });
  }

  /**
   * Genera una descripción para un curso con un prompt personalizado
   * @param courseTitle Título del curso
   * @param prompt Prompt personalizado del usuario
   * @returns Observable con la descripción generada
   */
  generateCourseDescriptionWithPrompt(
    courseTitle: string,
    prompt: string
  ): Observable<{ data: { description: string } }> {
    return this.http.post<{ data: { description: string } }>(`${this.apiUrl}/generate-course-description-with-prompt`, {
      courseTitle,
      prompt
    });
  }

  /**
   * Genera una descripción para un capítulo con un prompt personalizado
   * @param chapterTitle Título del capítulo
   * @param courseTitle Título del curso
   * @param courseDescription Descripción del curso
   * @param prompt Prompt personalizado del usuario
   * @returns Observable con la descripción generada
   */
  generateChapterDescriptionWithPrompt(
    chapterTitle: string,
    courseTitle: string,
    courseDescription: string,
    prompt: string
  ): Observable<{ data: { description: string } }> {
    return this.http.post<{ data: { description: string } }>(`${this.apiUrl}/generate-chapter-description-with-prompt`, {
      chapterTitle,
      courseTitle,
      courseDescription,
      prompt
    });
  }

  /**
   * Genera una descripción corta para un tema con un prompt personalizado
   * @param temaTitle Título del tema
   * @param chapterTitle Título del capítulo
   * @param courseTitle Título del curso
   * @param prompt Prompt personalizado del usuario
   * @returns Observable con la descripción generada
   */
  generateTemaDescriptionWithPrompt(
    temaTitle: string,
    chapterTitle: string,
    courseTitle: string,
    prompt: string
  ): Observable<{ data: { description: string } }> {
    return this.http.post<{ data: { description: string } }>(`${this.apiUrl}/generate-tema-description-with-prompt`, {
      temaTitle,
      chapterTitle,
      courseTitle,
      prompt
    });
  }
  /**
   * Sugiere títulos para un curso
   */
  suggestTitles(topic: string): Observable<{ data: { titles: string[] } }> {
    return this.http.post<{ data: { titles: string[] } }>(`${this.apiUrl}/suggest-titles`, { topic });
  }

  /**
   * Sugiere capítulos para un curso curado
   */
  suggestChapters(courseTitle: string, existingChapters: string[]): Observable<{ data: { chapters: any[] } }> {
    return this.http.post<{ data: { chapters: any[] } }>(`${this.apiUrl}/suggest-chapters`, { courseTitle, existingChapters });
  }

  /**
   * Genera una estructura completa de curso (Capítulos, Temas, Actividades)
   * @param title Título del curso
   * @param context Contexto opcional
   * @returns Observable con la estructura generada
   */
  /**
   * Sugiere títulos para un curso (Nueva versión con CourseAssistant)
   */
  suggestTitlesAI(idea: string): Observable<{ data: string[] }> {
    return this.http.post<{ data: string[] }>(`${this.assistantUrl}/suggest-titles`, { idea });
  }

  /**
   * Genera capítulos con progresión lógica (Nueva versión)
   */
  generateChaptersAI(courseTitle: string): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(`${this.assistantUrl}/generate-chapters`, { courseTitle });
  }

  /**
   * Genera temas para un capítulo (Nueva versión)
   */
  generateTopicsAI(courseTitle: string, chapterTitle: string): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(`${this.assistantUrl}/generate-topics`, { courseTitle, chapterTitle });
  }

  /**
   * Genera un conjunto de ejercicios para un tema (Nueva versión)
   */
  generateExerciseSetAI(topicTitle: string, quantity: number = 3, difficulty: string = 'Medio'): Observable<{ data: any[] }> {
    return this.http.post<{ data: any[] }>(`${this.assistantUrl}/generate-exercises`, { topicTitle, quantity, difficulty });
  }
}
