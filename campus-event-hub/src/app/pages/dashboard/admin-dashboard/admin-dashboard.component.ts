import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { RegistrationService } from '../../../services/registration.service';
import { FeedbackService } from '../../../services/feedback.service';
import { Event } from '../../../models/event.model';
import { User, UserRole } from '../../../models/user.model';
import { UsersManagementComponent } from './users-management/users-management.component';
import { AdminLogsComponent } from './admin-logs/admin-logs.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, UsersManagementComponent, AdminLogsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  activeTab = 'events';

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === UserRole.SUPER_ADMIN;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private registrationService = inject(RegistrationService);
  private feedbackService = inject(FeedbackService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadAdminEvents();
    }
  }

  loadAdminEvents() {
    if (!this.currentUser) return;
    this.error = null;

    const request$ = this.isSuperAdmin
      ? this.eventService.getAllEvents({ limit: 1000 })
      : this.eventService.getEventsByCollege(this.currentUser.id);

    request$.subscribe({
      next: (events: Event[]) => {
        this.events = events;
        this.loading = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (_error: unknown) => {
        this.error = 'Failed to load events.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  deleteEvent(eventId: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== eventId);
          this.cdr.detectChanges();
          alert('Event deleted successfully!');
        },
        error: () => {
          alert('Failed to delete event.');
        }
      });
    }
  }

  getTotalRegistrations(): number {
    return this.events.reduce((sum, e) => sum + e.registeredCount, 0);
  }

  getTotalSlots(): number {
    return this.events.reduce((sum, e) => sum + e.totalSlots, 0);
  }
}
