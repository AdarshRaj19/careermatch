
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface StudentProfile {
  // FIX: Added missing user_id to align with data from the backend.
  user_id: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  college: string;
  degree: string;
  branch: string;
  year: number;
  cgpa: string;
  creditsEarned: number;
  district: string;
  skills: string[];
  avatar_url?: string;
  // FIX: Added missing optional properties to align with database schema and fix type errors.
  resume_url?: string;
  consent_resume_parsing?: boolean;
  consent_profile_sharing?: boolean;
}

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer Received';

export interface Internship {
  id: string;
  title: string;
  organization: string;
  location: string;
  fitScore?: number;
  skills: string[];
  description: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior';
  applicationStatus?: ApplicationStatus;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  hours: number;
  rating: number;
  description: string;
  progress?: number;
}

export interface NotificationSettings {
  user_id: number;
  new_internship_alerts: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  alert_method_in_app: boolean;
  alert_method_email: boolean;
}