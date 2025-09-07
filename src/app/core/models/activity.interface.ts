export interface Activity {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityWithExercises {
  id: number;
  title: string;
  exercises: ExercisePreview[];
}

export interface ExercisePreview {
  id: number;
  statement: string;
  code: string;
  typeExercise: string;
  approach: string;
  hind: string;
  optionSelectOptions: string[];
  optionOrderFragmentCode: string[];
  optionOrderLineCode: string[];
  optionFindErrorCode: string[];
}

export interface CreateActivityRequest {
  temaId: number;
  title: string;
}

export interface UpdateActivityRequest {
  temaId: number;
  title: string;
}

export interface ApiActivityResponse {
  data: Activity[];
}

export interface ActivityProgressResponse {
  id: number;
  progress: number;
  score: number;
  accuracy: number;
  activity: string;
  gems: number;
}
