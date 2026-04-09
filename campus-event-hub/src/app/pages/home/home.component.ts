import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  authService = inject(AuthService);

  features = [
    {
      icon: '📋',
      title: 'Browse Events',
      description: 'Explore inter-college events across various categories',
      link: '/events'
    },
    {
      icon: '📍',
      title: 'Easy Registration',
      description: 'Quick and seamless registration for events',
      link: '/events'
    },
    {
      icon: '📊',
      title: 'Track Status',
      description: 'Real-time updates on your registrations and event details',
      link: '/dashboard/student'
    },
    {
      icon: '💬',
      title: 'Feedback & Discussions',
      description: 'Share feedback and engage with event communities',
      link: '/events'
    }
  ];
}
