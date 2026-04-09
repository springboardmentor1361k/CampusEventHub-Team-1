import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event, EventFilters, EventCategory, EventStatus } from '../models/event.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:5001/api/v1/events';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllEvents(filters?: EventFilters): Observable<Event[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.college) params = params.set('college', filters.college);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.searchQuery) params = params.set('search', filters.searchQuery);
      if (filters.startDate) params = params.set('startDate', filters.startDate.toString());
      if (filters.endDate) params = params.set('endDate', filters.endDate.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ApiResponse<Event[]>>(this.apiUrl, { params }).pipe(map(res => res.data || []));
  }

  getEventById(eventId: string): Observable<Event> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/${eventId}`).pipe(map(res => res.data));
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'registeredCount' | 'createdBy'>): Observable<Event> {
    return this.http.post<ApiResponse<Event>>(this.apiUrl, event).pipe(map(res => res.data));
  }

  updateEvent(eventId: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/${eventId}`, event).pipe(map(res => res.data));
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${eventId}`).pipe(map(() => void 0));
  }

  getEventsByCollege(collegeId: string): Observable<Event[]> {
    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/college/${collegeId}`).pipe(map(res => res.data || []));
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.getAllEvents({ status: EventStatus.UPCOMING });
  }

  searchEvents(query: string): Observable<Event[]> {
    return this.getAllEvents({ searchQuery: query });
  }

  getEventsByCategory(category: EventCategory): Observable<Event[]> {
    return this.getAllEvents({ category });
  }

  updateEventStatus(eventId: string, status: EventStatus): Observable<Event> {
    return this.http.patch<ApiResponse<Event>>(`${this.apiUrl}/${eventId}/status`, { status }).pipe(map(res => res.data));
  }
}
