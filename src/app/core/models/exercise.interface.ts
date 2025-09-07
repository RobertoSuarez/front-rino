export interface Exercise {
  id: number;
  statement: string;
  code: string;
  typeExercise: 'selection_single' | 'selection_multiple' | 'order_fragment_code' | 'order_line_code' | 'write_code' | 'find_error_code';
  difficulty: string;
  hind: string;
  activityId: number;
  optionSelectOptions: string[];
  optionOrderFragmentCode: string[];
  optionOrderLineCode: string[];
  optionsFindErrorCode: string[];
  answerSelectCorrect: string;
  answerSelectsCorrect: string[];
  answerOrderFragmentCode: string[];
  answerOrderLineCode: string[];
  answerFindError: string;
}

export interface ExerciseListItem {
  id: number;
  typeExercise: string;
  statement: string;
  title: string;
  approach: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseRequest {
  activityId: number;
  statement: string;
  code: string;
  difficulty: string;
  hind: string;
  typeExercise: 'selection_single' | 'selection_multiple' | 'order_fragment_code' | 'order_line_code' | 'write_code' | 'find_error_code';
  optionSelectOptions: string[];
  optionOrderFragmentCode: string[];
  optionOrderLineCode: string[];
  optionsFindErrorCode: string[];
  answerSelectCorrect: string;
  answerSelectsCorrect: string[];
  answerOrderFragmentCode: string[];
  answerOrderLineCode: string[];
  answerFindError: string;
}

export interface UpdateExerciseRequest {
  activityId?: number;
  statement?: string;
  code?: string;
  difficulty?: string;
  hind?: string;
  typeExercise?: 'selection_single' | 'selection_multiple' | 'order_fragment_code' | 'order_line_code' | 'write_code' | 'find_error_code';
  optionSelectOptions?: string[];
  optionOrderFragmentCode?: string[];
  optionOrderLineCode?: string[];
  optionsFindErrorCode?: string[];
  answerSelectCorrect?: string;
  answerSelectsCorrect?: string[];
  answerOrderFragmentCode?: string[];
  answerOrderLineCode?: string[];
  answerFindError?: string;
}

export interface CheckExerciseRequest {
  answerSelect?: string;
  answerSelects?: string[];
  answerOrderFragmentCode?: string[];
  answerOrderLineCode?: string[];
  answerWriteCode?: string;
  answerFindError?: string;
}

export interface FeedbackExerciseResponse {
  qualification: number;
  feedback: string;
}
