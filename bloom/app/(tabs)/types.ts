// types.ts - Shared TypeScript types

export interface UserPreferences {
  pronouns: string;
  goals: string[];
  reminderTime: string;
  notifications: boolean;
  stealthMode: boolean;
  motivationalMessages: boolean;
  customPronouns?: string;
}

export interface HrtEntry {
  type: 'hrt' | 'milestone';
  notes: string;
  timestamp: string;
}

export interface HrtEntries {
  [date: string]: HrtEntry;
}

export interface JournalEntry {
  id: string;
  mood: number;
  gratitude: string;
  progress: string;
  challenges: string;
  goals: string;
  date: string;
}

export interface Resource {
  name: string;
  type: string;
  description: string;
  location: string;
  url?: string;
  phone?: string;
}

export interface ResourceCategory {
  title: string;
  icon: string;
  resources: Resource[];
}

export interface ResourceCategories {
  [key: string]: ResourceCategory;
}