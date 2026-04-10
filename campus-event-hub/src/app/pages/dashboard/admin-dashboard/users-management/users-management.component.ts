import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error: string | null = null;
  currentUserId: string | undefined;

  private authService = inject(AuthService);

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()?.id;
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u._id !== userId);
          alert('User deleted successfully.');
        },
        error: (err) => {
          alert('Failed to delete user: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
