import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // On the server (SSR), always allow — real auth check happens after client hydration
    if (!this.isBrowser) {
      return true;
    }

    if (this.authService.isAuthenticated()) {
      // Check for required roles
      const requiredRoles: UserRole[] = route.data['roles'];
      if (requiredRoles && !this.authService.hasRole(requiredRoles)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
      return true;
    }

    // Store the attempted URL for redirecting after login
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
