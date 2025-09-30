export interface Exercise {
  id: number;
  statement: string;
  code: string;
  typeExercise: 'selection_single' | 'selection_multiple' | 'vertical_ordering' | 'horizontal_ordering' | 'phishing_selection_multiple' | 'match_pairs';
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
  answerWriteCode: string;
  // Nuevos campos para vertical_ordering
  optionsVerticalOrdering: string[];
  answerVerticalOrdering: string[];
  // Nuevos campos para horizontal_ordering
  optionsHorizontalOrdering: string[];
  answerHorizontalOrdering: string[];
  // Nuevos campos para phishing_selection_multiple
  optionsPhishingSelection: string[];
  answerPhishingSelection: string[];
  phishingContext: string;
  phishingImageUrl: string;
  // Nuevos campos para match_pairs
  optionsMatchPairsLeft: string[];
  optionsMatchPairsRight: string[];
  answerMatchPairs: { left: string; right: string }[];
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
  typeExercise: 'selection_single' | 'selection_multiple' | 'vertical_ordering' | 'horizontal_ordering' | 'phishing_selection_multiple' | 'match_pairs';
  optionSelectOptions: string[];
  optionOrderFragmentCode: string[];
  optionOrderLineCode: string[];
  optionsFindErrorCode: string[];
  answerSelectCorrect: string;
  answerSelectsCorrect: string[];
  answerOrderFragmentCode: string[];
  answerOrderLineCode: string[];
  answerFindError: string;
  answerWriteCode: string;
  optionsVerticalOrdering: string[];
  answerVerticalOrdering: string[];
  optionsHorizontalOrdering: string[];
  answerHorizontalOrdering: string[];
  optionsPhishingSelection: string[];
  answerPhishingSelection: string[];
  phishingContext: string;
  phishingImageUrl: string;
  optionsMatchPairsLeft: string[];
  optionsMatchPairsRight: string[];
  answerMatchPairs: { left: string; right: string }[];
}

export interface UpdateExerciseRequest {
  activityId?: number;
  statement?: string;
  code?: string;
  difficulty?: string;
  hind?: string;
  typeExercise?: 'selection_single' | 'selection_multiple' | 'vertical_ordering' | 'horizontal_ordering' | 'phishing_selection_multiple' | 'match_pairs';
  optionSelectOptions?: string[];
  optionOrderFragmentCode?: string[];
  optionOrderLineCode?: string[];
  optionsFindErrorCode?: string[];
  answerSelectCorrect?: string;
  answerSelectsCorrect?: string[];
  answerOrderFragmentCode?: string[];
  answerOrderLineCode?: string[];
  answerFindError?: string;
  answerWriteCode?: string;
  optionsVerticalOrdering?: string[];
  answerVerticalOrdering?: string[];
  optionsHorizontalOrdering?: string[];
  answerHorizontalOrdering?: string[];
  optionsPhishingSelection?: string[];
  answerPhishingSelection?: string[];
  phishingContext?: string;
  phishingImageUrl?: string;
  optionsMatchPairsLeft?: string[];
  optionsMatchPairsRight?: string[];
  answerMatchPairs?: { left: string; right: string }[];
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
