import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FeedbackService } from '../../../services/feedback.service';
import { EventService } from '../../../services/event.service';
import { Feedback } from '../../../models/registration.model';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="dashboard-navbar" style="padding: 15px 30px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0;">Feedback Analysis Dashboard</h2>
      <a routerLink="/dashboard/admin" style="padding: 8px 16px; background: #6c757d; color: white; text-decoration: none; border-radius: 4px;">Back to Dashboard</a>
    </nav>
    <div style="padding: 30px; max-width: 1200px; margin: 0 auto;">
      <div *ngIf="loading" style="text-align: center; padding: 40px;">Loading feedback...</div>
      <div *ngIf="!loading && event">
        <h2>{{event.title}} - Feedback Analysis</h2>
        
        <div style="display: flex; gap: 20px; margin: 20px 0;">
          <div style="flex: 1; padding: 24px; background: linear-gradient(135deg, #4b6cb7, #182848); border-radius: 12px; text-align: center; color: white;">
            <h3 style="margin: 0 0 10px;">Average Rating</h3>
            <span style="font-size: 36px; font-weight: bold;">{{ getAverageRating() }}/5.0</span>
          </div>
          <div style="flex: 1; padding: 24px; background: linear-gradient(135deg, #11998e, #38ef7d); border-radius: 12px; text-align: center; color: white;">
            <h3 style="margin: 0 0 10px;">Total Reviews</h3>
            <span style="font-size: 36px; font-weight: bold;">{{ feedback.length }}</span>
          </div>
        </div>

        <!-- Rating Distribution -->
        <div *ngIf="feedback.length > 0" style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3>Rating Distribution</h3>
          <div *ngFor="let star of [5,4,3,2,1]" style="display: flex; align-items: center; margin: 8px 0;">
            <span style="width: 60px;">{{star}} Star</span>
            <div style="flex: 1; height: 20px; background: #e9ecef; border-radius: 10px; margin: 0 10px; overflow: hidden;">
              <div [style.width.%]="getRatingPercent(star)" style="height: 100%; background: #4b6cb7; border-radius: 10px; transition: width 0.3s;"></div>
            </div>
            <span style="width: 40px; text-align: right;">{{getRatingCount(star)}}</span>
          </div>
        </div>

        <div *ngIf="feedback.length === 0" style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
          <p>No feedback items yet.</p>
        </div>
        <div *ngIf="feedback.length > 0">
          <h3>All Reviews</h3>
          <div *ngFor="let f of feedback" style="padding: 16px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 12px; background: white;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>User: {{ f.userId }}</strong>
              <span style="background: rgba(75, 108, 183, 0.15); color: #4b6cb7; padding: 4px 10px; border-radius: 4px; font-weight: bold;">⭐ {{ f.rating }}/5</span>
            </div>
            <p style="margin: 0; color: #555;">{{ f.comments }}</p>
            <div style="margin-top: 10px; font-size: 12px; color: #888;">{{ f.timestamp | date:'medium' }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminFeedbackComponent implements OnInit {
  feedback: Feedback[] = [];
  event: Event | null = null;
  loading = true;

  private route = inject(ActivatedRoute);
  private feedbackService = inject(FeedbackService);
  private eventService = inject(EventService);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventService.getEventById(eventId).subscribe((e: Event) => this.event = e);
      this.loadFeedback(eventId);
    }
  }

  loadFeedback(eventId: string): void {
    this.feedbackService.getEventFeedback(eventId).subscribe({
      next: (fb: Feedback[]) => {
        this.feedback = fb;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getAverageRating(): string {
    if (this.feedback.length === 0) return '0.0';
    const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
    return (total / this.feedback.length).toFixed(1);
  }

  getRatingCount(star: number): number {
    return this.feedback.filter(f => f.rating === star).length;
  }

  getRatingPercent(star: number): number {
    if (this.feedback.length === 0) return 0;
    return (this.getRatingCount(star) / this.feedback.length) * 100;
  }
}
