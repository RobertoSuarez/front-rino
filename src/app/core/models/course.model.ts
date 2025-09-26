import { User } from "./user.interface";

export interface Course {
  id: number;
  title: string;
  description?: string; // Campo opcional
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
export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  code: string;
  urlLogo: string;
  index: number;
  isPublic: boolean;
  createdBy: string;
  updatedAt: string;
}




export interface CourseSubscription {
    id: number;
    title: string;
    code: string;
    chapters: number;
    index: number;
    urlLogo: string;
    progress: number;
}