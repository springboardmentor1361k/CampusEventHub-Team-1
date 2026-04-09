import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/components/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/auth/components/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'events',
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/events/components/event-listing/event-listing.component').then(m => m.EventListingComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./modules/events/components/event-creation/event-creation.component').then(m => m.EventCreationComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: ':id',
        loadComponent: () => import('./modules/events/components/event-detail/event-detail.component').then(m => m.EventDetailComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'dashboard',
    children: [
      {
        path: 'student',
        loadComponent: () => import('./pages/dashboard/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.STUDENT] }
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'admin/participants/:eventId',
        loadComponent: () => import('./pages/dashboard/admin-participants/admin-participants.component').then(m => m.AdminParticipantsComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'admin/feedback/:eventId',
        loadComponent: () => import('./pages/dashboard/admin-feedback/admin-feedback.component').then(m => m.AdminFeedbackComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN] }
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
