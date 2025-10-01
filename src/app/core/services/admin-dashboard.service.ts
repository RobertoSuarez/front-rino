import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminDashboardStats {
  users: {
    total: number;
    admins: number;
    teachers: number;
    students: number;
    active: number;
    verified: number;
    approved: number;
    recent: number;
  };
  content: {
    courses: number;
    learningPaths: number;
    chapters: number;
    temas: number;
    activities: number;
  };
  subscriptions: {
    total: number;
    active: number;
  };
  recentUsers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    typeUser: string;
    urlAvatar: string;
    status: string;
    createdAt: string;
  }>;
  recentCourses: Array<{
    id: number;
    title: string;
    code: string;
    urlLogo: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
  popularPaths: Array<{
    id: number;
    name: string;
    code: string;
    subscriptionsCount: number;
    createdBy: {
      firstName: string;
      lastName: string;
    };
  }>;
  usersByType: Array<{
    type: string;
    count: number;
  }>;
  contentStats: Array<{
    category: string;
    count: number;
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
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<ApiResponse<AdminDashboardStats>> {
    return this.http.get<ApiResponse<AdminDashboardStats>>(`${this.apiUrl}/stats`);
  }
}
