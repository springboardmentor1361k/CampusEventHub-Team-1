export interface Event {
  id: string;
  collegeId: string;
  collegeName?: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: Date;
  endDate: Date;
  totalSlots: number;
  registeredCount: number;
  image?: string;
  requirements?: string;
  prizes?: string;
  rules?: string;
  contactEmail?: string;
  contactPhone?: string;
  entryFee?: number;
  status: EventStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export enum EventCategory {
  SPORTS = 'sports',
  HACKATHON = 'hackathon',
  CULTURAL = 'cultural',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  COMPETITION = 'competition',
  CONFERENCE = 'conference'
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface EventFilters {
  category?: EventCategory;
  college?: string;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  searchQuery?: string;
  limit?: number;
}
