export interface Registration {
  id: string;
  eventId: any; // Can be string (ID) or populated Event object
  userId: any; // Can be string (ID) or populated User object { name, email, college }
  status: RegistrationStatus;
  approvalDate?: Date;
  rejectionReason?: string;
  registrationDate?: Date;
  timestamp?: Date;
  createdAt?: Date;
  userDetails?: {
    name: string;
    email: string;
  };
}

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number; // 1-5 rating
  comments: string;
  timestamp: Date;
  userDetails?: {
    name: string;
    email: string;
  };
}

export interface AdminLog {
  id: string;
  action: string;
  userId: string;
  entityType: string; // 'event', 'registration', 'user', etc.
  entityId: string;
  changes?: any;
  timestamp: Date;
}
