import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalStudents: number;
  totalLearningPaths: number;
  totalCourses: number;
  activeSubscriptions: number;
  averageAccuracy: number; // Nueva métrica
  averageScore: number; // Nueva métrica
  studentsAtRiskCount: number;
  lowPerformanceStudents: Array<{ // Nueva lista de riesgo
    id: number;
    name: string;
    avatar: string;
    averageAccuracy: number;
  }>;
  recentStudents: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    urlAvatar: string;
    subscribedAt: string;
    pathName: string;
  }>;
  topLearningPaths: Array<{
    id: number;
    name: string;
    code: string;
    studentsCount: number;
    coursesCount: number;
  }>;
  recentCourses: Array<{
    id: number;
    title: string;
    code: string;
    urlLogo: string;
    chaptersCount: number;
    createdAt: string;
  }>;
  studentsByPath: Array<{
    pathName: string;
    count: number;
  }>;
}

export interface StudentInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  urlAvatar: string;
  yachay: number;
  paths: Array<{
    id: number;
    name: string;
    code: string;
    subscribedAt: string;
  }>;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardService {
  private apiUrl = `${environment.apiUrl}/teacher/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }

  getStudentsList(): Observable<ApiResponse<StudentInfo[]>> {
    return this.http.get<ApiResponse<StudentInfo[]>>(`${this.apiUrl}/students`);
  }
}
