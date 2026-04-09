import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { EventCategory } from '../../../../models/event.model';

@Component({
  selector: 'app-event-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-creation.component.html',
  styleUrls: ['./event-creation.component.css']
})
export class EventCreationComponent {
  eventForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  success = false;

  categories = Object.values(EventCategory);

  private formBuilder = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);

  constructor() {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(5)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      totalSlots: ['', [Validators.required, Validators.min(1)]],
      image: [''],
      requirements: [''],
      prizes: [''],
      rules: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      entryFee: [0, [Validators.min(0)]]
    }, { validators: this.dateValidator });
  }

  dateValidator(form: FormGroup) {
    const startDate = new Date(form.get('startDate')?.value);
    const endDate = new Date(form.get('endDate')?.value);
    return startDate < endDate ? null : { invalidDateRange: true };
  }

  get f() {
    return this.eventForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.eventForm.invalid) {
      this.error = 'Please check the form for errors. Ensure all fields meet the minimum requirements (e.g. Description at least 20 characters).';
      // Mark all fields as touched to display the individual red error texts
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const eventData = {
      ...this.eventForm.value,
      startDate: new Date(this.eventForm.value.startDate),
      endDate: new Date(this.eventForm.value.endDate),
      totalSlots: parseInt(this.eventForm.value.totalSlots),
      entryFee: parseFloat(this.eventForm.value.entryFee) || 0
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (event) => {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/events', event.id]);
        }, 1000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to create event.';
        this.loading = false;
      }
    });
  }
}
