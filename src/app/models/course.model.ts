export interface Course {
  id: number;
  title: string;
  description: string;
  code: string;
  urlLogo: string | null;
  index: number;
  isPublic: boolean;
}

export interface GetCourseByIdResponse {
  statusCode: number;
  message: string;
  data: Course;
}
