import { Component, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { RegisterRequest, UserRole } from '../../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  userRoles = [
    { value: UserRole.STUDENT, label: 'Student' },
    { value: UserRole.COLLEGE_ADMIN, label: 'College Admin' }
  ];
  colleges = [
    'IIT Delhi',
    'IIT Bombay',
    'Delhi University',
    'Mumbai University',
    'Bangalore Institute of Technology',
    'Other'
  ];

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor() {
    // If already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      college: ['', Validators.required],
      role: [UserRole.STUDENT, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const registerRequest: RegisterRequest = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      college: this.registerForm.value.college,
      role: this.registerForm.value.role
    };

    this.authService.register(registerRequest).subscribe({
      next: () => {
        // Redirect based on user role
        const user = this.authService.getCurrentUser();
        if (user?.role === UserRole.COLLEGE_ADMIN || user?.role === UserRole.SUPER_ADMIN) {
          this.router.navigate(['/dashboard/admin']);
        } else {
          this.router.navigate(['/dashboard/student']);
        }
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.loading = false;
          if (err.status === 400 && err.error?.message === 'Email already in use') {
            this.error = 'This email is already registered. Please log in or use another email.';
          } else {
            this.error = err.error?.message || 'Registration failed. Please try again.';
          }
          this.cdr.detectChanges();
        });
      }
    });
  }
}
