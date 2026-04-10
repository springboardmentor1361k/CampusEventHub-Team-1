import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Feedback, AdminLog } from '../models/registration.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:5001/api/v1/feedback';
  private logsUrl = 'http://localhost:5001/api/v1/feedback/admin/logs';

  constructor(private http: HttpClient) {}

  submitFeedback(eventId: string, userId: string, rating: number, comments: string): Observable<Feedback> {
    return this.http.post<ApiResponse<Feedback>>(this.apiUrl, { eventId, userId, rating, comments })
      .pipe(map(res => res.data));
  }

  getEventFeedback(eventId: string): Observable<Feedback[]> {
    return this.http.get<ApiResponse<Feedback[]>>(`${this.apiUrl}/event/${eventId}`)
      .pipe(map(res => res.data || []));
  }

  getUserFeedback(userId: string): Observable<Feedback[]> {
    return this.http.get<ApiResponse<Feedback[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(res => res.data || []));
  }

  getFeedbackStats(eventId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats/${eventId}`)
      .pipe(map(res => res.data));
  }

  updateFeedback(feedbackId: string, rating: number, comments: string): Observable<Feedback> {
    return this.http.put<ApiResponse<Feedback>>(`${this.apiUrl}/${feedbackId}`, { rating, comments })
      .pipe(map(res => res.data));
  }

  deleteFeedback(feedbackId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${feedbackId}`)
      .pipe(map(() => void 0));
  }

  getAdminLogs(filter?: { userId?: string; entityType?: string }): Observable<AdminLog[]> {
    let params = new HttpParams();
    if (filter?.userId) params = params.set('userId', filter.userId);
    if (filter?.entityType) params = params.set('entityType', filter.entityType);
    
    return this.http.get<ApiResponse<AdminLog[]>>(this.logsUrl, { params })
      .pipe(map(res => res.data || []));
  }

  logAdminAction(action: string, entityType: string, entityId: string, changes?: any): Observable<AdminLog> {
    return this.http.post<ApiResponse<AdminLog>>(this.logsUrl, { action, entityType, entityId, changes })
      .pipe(map(res => res.data));
  }
}
