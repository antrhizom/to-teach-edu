export type Group = 'nilpferde' | 'ameise' | 'schildkroeten' | 'drachen' | 'kuehe';

export interface GroupInfo {
  name: string;
  emoji: string;
  color: string;
}

export interface User {
  userId: string;
  username: string;
  group: Group;
  code: string;
  email: string;
  isVirtual?: boolean;
  createdAt: string;
  completedSubtasks: Record<string, string>;
  ratings: Record<number, TaskRating>;
  certificateIssued?: boolean;
  certificateIssuedAt?: string;
  finalRank?: number;
}

export interface TaskRating {
  enjoyed: number;
  useful: number;
  learned: number;
  timestamp: string;
}

export interface Task {
  id: number;
  title: string;
  type: 'individual' | 'group';
  lionColor: string;
  lionEmoji: string;
  subtasks: string[];
  pdfUrl?: string;
  pdfId?: string;
  whiteboardUrl?: string;
  padletUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  group: Group | 'admin';
  text: string;
  timestamp: string;
}

export interface PDFData {
  fileName: string;
  url: string;
  uploadedAt: string;
  taskId: string;
}

export interface RatingQuestion {
  id: 'enjoyed' | 'useful' | 'learned';
  label: string;
  emoji: string;
}

export interface RatingOption {
  value: number;
  label: string;
  emoji: string;
  color: string;
}

export interface Certificate {
  userId: string;
  username: string;
  group: Group;
  rank: number;
  totalParticipants: number;
  completionPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
  issuedAt: string;
  issuedBy: string;
}

export interface AdminSettings {
  certificatesEnabled: boolean;
  certificatesIssuedAt?: string;
}
