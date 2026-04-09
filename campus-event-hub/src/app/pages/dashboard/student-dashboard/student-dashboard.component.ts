import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegistrationService } from '../../../services/registration.service';
import { FeedbackService } from '../../../services/feedback.service';
import { Registration } from '../../../models/registration.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  registrations: Registration[] = [];
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;

  private authService = inject(AuthService);
  private registrationService = inject(RegistrationService);
  private feedbackService = inject(FeedbackService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserRegistrations();
    }
  }

  loadUserRegistrations() {
    const userId = this.currentUser?.id;
    if (!userId) return;

    this.loading = true;
    this.cdr.detectChanges();

    this.registrationService.getUserRegistrations(userId).subscribe({
      next: (registrations: Registration[]) => {
        this.registrations = registrations;
        this.loading = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (_error: unknown) => {
        this.error = 'Failed to load your registrations.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
