import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { RegistrationService } from '../../../../services/registration.service';
import { FeedbackService } from '../../../../services/feedback.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Event } from '../../../../models/event.model';
import { Feedback } from '../../../../models/registration.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  feedback: Feedback[] = [];
  isUserRegistered = false;
  isStudent = false;
  registrationStatus: string | null = null;
  loading = true;
  error: string | null = null;

  feedbackRating: number = 5;
  feedbackComment: string = '';
  isSubmittingFeedback = false;

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private registrationService = inject(RegistrationService);
  private feedbackService = inject(FeedbackService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.isStudent = this.authService.getCurrentUser()?.role === 'student';
    
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(eventId);
      this.loadFeedback(eventId);
      this.checkUserRegistration(eventId);
    }
  }

  loadEventDetails(eventId: string) {
    this.error = null;
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.error = 'Failed to load event details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFeedback(eventId: string) {
    this.feedbackService.getEventFeedback(eventId).subscribe({
      next: (feedback) => {
        this.feedback = feedback;
      },
      error: () => {
        // Silent error
      }
    });
  }

  checkUserRegistration(eventId: string) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.registrationService.isUserRegistered(eventId, user.id).subscribe({
        next: (isRegistered) => {
          this.isUserRegistered = isRegistered;
          // Get full registration details for status check
          this.registrationService.getUserRegistrations(user.id).subscribe(regs => {
            const currentReg = regs.find(r => (r.eventId?.id || r.eventId) === eventId);
            this.registrationStatus = currentReg ? currentReg.status : null;
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  registerForEvent() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.event) return;

    this.registrationService.registerForEvent(this.event.id, user.id).subscribe({
      next: () => {
        this.isUserRegistered = true;
        alert('Successfully registered for the event!');
      },
      error: (error) => {
        alert('Failed to register. ' + (error.error?.message || ''));
      }
    });
  }

  getAverageRating(): number {
    if (this.feedback.length === 0) return 0;
    const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
    return Math.round(total / this.feedback.length * 10) / 10;
  }

  submitFeedback() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.event || !this.feedbackComment.trim()) return;

    this.isSubmittingFeedback = true;
    this.feedbackService.submitFeedback(
      this.event.id,
      user.id,
      this.feedbackRating,
      this.feedbackComment
    ).subscribe({
      next: (newFeedback: Feedback) => {
        newFeedback.userDetails = { name: user.name, email: user.email };
        this.feedback.unshift(newFeedback);
        this.feedbackComment = '';
        this.feedbackRating = 5;
        this.isSubmittingFeedback = false;
        alert('Feedback submitted successfully! Thank you.');
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.isSubmittingFeedback = false;
        const msg = e.error?.message || 'Please try again later.';
        alert('Failed to submit feedback: ' + msg);
        this.cdr.detectChanges();
      }
    });
  }
}
