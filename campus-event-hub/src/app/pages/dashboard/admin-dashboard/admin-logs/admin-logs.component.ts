import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css']
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  loading = true;
  error: string | null = null;
  totalLogs = 0;
  currentPage = 1;

  private authService = inject(AuthService);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.error = null;
    this.authService.getAdminLogs(this.currentPage, 50).subscribe({
      next: (response: any) => {
        this.logs = response.data;
        this.totalLogs = response.total;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load admin logs';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getChangesDisplay(changes: any): string {
    if (!changes) return '-';
    try {
      const keys = Object.keys(changes);
      if (keys.length === 0) return '-';
      if (changes.title) return `Title: ${changes.title}`;
      if (changes.deletedEmail) return `Email: ${changes.deletedEmail}`;
      if (changes.newStatus) return `Status: ${changes.newStatus}`;
      return JSON.stringify(changes);
    } catch {
      return 'Complex object';
    }
  }
}
