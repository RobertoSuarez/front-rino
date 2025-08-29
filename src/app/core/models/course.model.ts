export interface Course {
  id: number;
  title: string;
  createdBy: string;
  chapters: string;
  code: string;
  urlLogo: string | null;
  index: number;
  isPublic: boolean;
  createAt: string;
  updatedAt: string;
}

export interface ApiCourseResponse {
  statusCode: number;
  message: string;
  data: Course[];
}
