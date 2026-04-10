import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { EventService } from '../../../../services/event.service';
import { Event, EventCategory, EventStatus } from '../../../../models/event.model';

@Component({
  selector: 'app-event-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-listing.component.html',
  styleUrls: ['./event-listing.component.css']
})
export class EventListingComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;

  categories = Object.values(EventCategory);
  eventStatuses = Object.values(EventStatus);

  private eventService = inject(EventService);
  private formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.filterForm = this.formBuilder.group({
      category: [''],
      status: [''],
      searchQuery: ['']
    });
  }

  ngOnInit() {
    this.loadEvents();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadEvents() {
    this.error = null;
    console.log('[EventListing] Starting to load events...');
    
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        console.log('[EventListing] Received events:', events.length);
        this.events = events;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[EventListing] Error loading events:', error);
        this.error = 'Failed to load events. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    this.filteredEvents = this.events.filter(event => {
      if (filters.category && event.category !== filters.category) return false;
      if (filters.status && event.status !== filters.status) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return event.title.toLowerCase().includes(query) ||
               event.description.toLowerCase().includes(query);
      }
      return true;
    });
  }

  getAvailableSlots(event: Event): number {
    return event.totalSlots - event.registeredCount;
  }
}
