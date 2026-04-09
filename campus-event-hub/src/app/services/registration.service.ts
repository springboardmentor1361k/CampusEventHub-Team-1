import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Registration, RegistrationStatus } from '../models/registration.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:5001/api/v1/registrations';

  constructor(private http: HttpClient) {}

  registerForEvent(eventId: string, userId: string): Observable<Registration> {
    return this.http.post<ApiResponse<Registration>>(this.apiUrl, { eventId, userId })
      .pipe(map(res => res.data));
  }

  getUserRegistrations(userId: string): Observable<Registration[]> {
    return this.http.get<ApiResponse<Registration[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(res => res.data || []));
  }

  getEventRegistrations(eventId: string): Observable<Registration[]> {
    return this.http.get<ApiResponse<Registration[]>>(`${this.apiUrl}/event/${eventId}`)
      .pipe(map(res => res.data || []));
  }

  approveRegistration(registrationId: string): Observable<Registration> {
    return this.http.patch<ApiResponse<Registration>>(`${this.apiUrl}/${registrationId}/approve`, {})
      .pipe(map(res => res.data));
  }

  rejectRegistration(registrationId: string, rejectionReason: string): Observable<Registration> {
    return this.http.patch<ApiResponse<Registration>>(`${this.apiUrl}/${registrationId}/reject`, { rejectionReason })
      .pipe(map(res => res.data));
  }

  cancelRegistration(registrationId: string): Observable<Registration> {
    return this.http.patch<ApiResponse<Registration>>(`${this.apiUrl}/${registrationId}/cancel`, {})
      .pipe(map(res => res.data));
  }

  getRegistrationById(registrationId: string): Observable<Registration> {
    return this.http.get<ApiResponse<Registration>>(`${this.apiUrl}/${registrationId}`)
      .pipe(map(res => res.data));
  }

  isUserRegistered(eventId: string, userId: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/check/${eventId}/${userId}`)
      .pipe(map(res => !!(res.isRegistered || res.data)));
  }
}
