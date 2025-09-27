export type Role = "organizer" | "attendee";

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Event {
  id: number;
  organizerId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
}

// Add a type for your environment variables
export interface Env {
  DATABASE_URL: string;  // connection string must be a string
}
