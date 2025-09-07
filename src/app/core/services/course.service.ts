import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiCourseResponse } from '../models/course.model';
import { environment } from '../../../environments/environment';
import { GetCourseByIdResponse } from '../../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) { }

  getCourses(): Observable<ApiCourseResponse> {
    return this.http.get<ApiCourseResponse>(this.apiUrl);
  }

  getCourseById(id: number | string): Observable<GetCourseByIdResponse> {
    return this.http.get<GetCourseByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
