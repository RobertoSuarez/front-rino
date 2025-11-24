import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

export interface GenerateExercisesRequest {
  prompt: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  quantity: number;
  exerciseTypes?: string[];
  context?: string;
  balanceTypes?: boolean;
}

export interface GeneratedExercise {
  id: string;
  statement: string;
  difficulty: string;
  typeExercise: string;
  optionSelectOptions?: string[];
  optionOrderFragmentCode?: string[];
  optionOrderLineCode?: string[];
  optionsFindErrorCode?: string[];
  answerSelectCorrect?: string;
  answerSelectsCorrect?: string[];
  answerOrderFragmentCode?: string[];
  answerOrderLineCode?: string[];
  answerFindError?: string;
  code?: string;
  hint?: string;
  
  // Match Pairs
  leftItems?: string[];
  rightItems?: string[];
  pairs?: Array<{ left: string; right: string }>;

  // Nuevos campos
  optionsVerticalOrdering?: string[];
  answerVerticalOrdering?: string[];
  optionsHorizontalOrdering?: string[];
  answerHorizontalOrdering?: string[];
  optionsPhishingSelection?: string[];
  answerPhishingSelection?: string[];
  phishingContext?: string;
  phishingImageUrl?: string;
}

export interface GenerateExercisesResponse {
  count: number;
  exercises: GeneratedExercise[];
  generationTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseGenerationService {
  private apiUrl = `${environment.apiUrl}/openai/exercises`;

  constructor(private http: HttpClient) {}

  generateExercisesWithPrompt(request: GenerateExercisesRequest): Observable<ApiResponse<GenerateExercisesResponse>> {
    return this.http.post<ApiResponse<GenerateExercisesResponse>>(
      `${this.apiUrl}/generate-with-prompt`,
      request
    );
  }
}
