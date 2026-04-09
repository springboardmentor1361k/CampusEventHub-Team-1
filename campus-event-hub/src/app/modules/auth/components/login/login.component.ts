import { Component, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { LoginRequest, UserRole } from '../../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string = '';
  returnUrl: string = '';

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor() {
    // If already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.loading = false;
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]);
          return;
        }

        const user = this.authService.getCurrentUser();
        if (user?.role === UserRole.COLLEGE_ADMIN || user?.role === UserRole.SUPER_ADMIN) {
          this.router.navigate(['/dashboard/admin']);
          return;
        }

        this.router.navigate(['/dashboard/student']);
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.loading = false;
          if (err.status === 401) {
            this.errorMessage = 'Incorrect email or password. Please try again.';
          } else if (err.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please try again later.';
          } else if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Incorrect credentials. Please try again.';
          }
          this.cdr.detectChanges();
        });
      }
    });
  }
}
