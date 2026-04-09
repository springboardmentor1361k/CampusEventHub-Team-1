import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RegistrationService } from '../../../services/registration.service';
import { EventService } from '../../../services/event.service';
import { Registration } from '../../../models/registration.model';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-admin-participants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 30px; max-width: 1200px; margin: 0 auto;">
      <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <a routerLink="/dashboard/admin" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 14px;">← Back to Dashboard</a>
          <h1 *ngIf="event" style="margin: 10px 0 0 0; color: #333;">{{event.title}} - Participants</h1>
        </div>
      </div>

      <div *ngIf="loading" style="text-align: center; padding: 40px; color: #666;">Loading participants...</div>
      
      <div *ngIf="!loading && event">
        <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
          <p style="margin: 0; color: #666; font-size: 16px;">Total registrations: <strong>{{registrations.length}}</strong></p>
        </div>

        <div *ngIf="registrations.length === 0" style="text-align: center; padding: 60px; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ccc;">
          <p style="color: #888; font-size: 18px;">No participants have registered yet.</p>
        </div>

        <div *ngIf="registrations.length > 0" style="overflow-x: auto; border-radius: 8px; border: 1px solid #eee;">
          <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead>
              <tr style="background: #f9f9f9; border-bottom: 2px solid #667eea; text-align: left;">
                <th style="padding: 15px; color: #667eea; font-size: 13px; text-transform: uppercase;">#</th>
                <th style="padding: 15px; color: #667eea; font-size: 13px; text-transform: uppercase;">Participant</th>
                <th style="padding: 15px; color: #667eea; font-size: 13px; text-transform: uppercase;">Status</th>
                <th style="padding: 15px; color: #667eea; font-size: 13px; text-transform: uppercase;">Registered Date</th>
                <th style="padding: 15px; color: #667eea; font-size: 13px; text-transform: uppercase;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of registrations; let i = index" style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 15px;">{{i + 1}}</td>
                <td style="padding: 12px 15px;">
                  <div style="font-weight: 600; color: #333;">{{reg.userId?.name || 'Unknown User'}}</div>
                  <div style="font-size: 12px; color: #777;">{{reg.userId?.email || reg.userId}}</div>
                </td>
                <td style="padding: 12px 15px;">
                  <span [style.background]="getStatusColor(reg.status)" style="padding: 4px 10px; border-radius: 20px; color: white; font-weight: 600; font-size: 11px; text-transform: uppercase;">
                    {{reg.status | titlecase}}
                  </span>
                </td>
                <td style="padding: 12px 15px; color: #555;">{{reg.registrationDate || reg.createdAt | date:'medium'}}</td>
                <td style="padding: 12px 15px;">
                  <div style="display: flex; gap: 8px;">
                    <button *ngIf="reg.status === 'pending'" (click)="approve(reg.id)" style="background: #28a745; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;">Approve</button>
                    <button *ngIf="reg.status === 'pending'" (click)="reject(reg.id)" style="background: #dc3545; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;">Reject</button>
                    <span *ngIf="reg.status !== 'pending'" style="color: #aaa; font-size: 12px;">No actions available</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminParticipantsComponent implements OnInit {
  registrations: Registration[] = [];
  event: Event | null = null;
  loading = true;

  private route = inject(ActivatedRoute);
  private regService = inject(RegistrationService);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.loading = true;
      this.cdr.detectChanges();
      
      this.eventService.getEventById(eventId).subscribe({
        next: (e: Event) => {
          this.event = e;
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Failed to load event details.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
      
      this.loadParticipants(eventId);
    }
  }

  loadParticipants(eventId: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.regService.getEventRegistrations(eventId).subscribe((regs: Registration[]) => {
      this.registrations = regs;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  approve(id: string): void {
    this.regService.approveRegistration(id).subscribe(() => {
      const r = this.registrations.find(x => x.id === id);
      if (r) r.status = 'approved' as any;
      this.cdr.detectChanges();
    });
  }

  reject(id: string): void {
    const reason = prompt('Reason for rejection:');
    if (reason !== null) {
      this.regService.rejectRegistration(id, reason).subscribe(() => {
        const r = this.registrations.find(x => x.id === id);
        if (r) r.status = 'rejected' as any;
        this.cdr.detectChanges();
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  }
}
