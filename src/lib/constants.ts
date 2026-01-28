import { GroupInfo, Task, RatingQuestion, RatingOption } from '@/types';

export const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN2025";

export const GROUPS: Record<string, GroupInfo> = {
  nilpferde: { name: 'Nilpferde', emoji: '🦛', color: '#3498db' },
  ameise: { name: 'Ameise', emoji: '🐜', color: '#e74c3c' },
  schildkroeten: { name: 'Schildkröten', emoji: '🐢', color: '#2ecc71' },
  drachen: { name: 'Drachen', emoji: '🐉', color: '#f39c12' },
  kuehe: { name: 'Kühe', emoji: '🐄', color: '#9b59b6' }
};

export const TASKS: Task[] = [
  { 
    id: 1, 
    title: 'Ein KI-Chatbot steht zur Verfügung', 
    type: 'individual', 
    lionColor: 'red', 
    lionEmoji: '🦁',
    subtasks: [
      'Ich habe Zugriff auf den KI-Chat von Microsoft', 
      'Ich weiss, dass ich den Input genau definieren muss'
    ],
    pdfId: 'task1' 
  },
  { 
    id: 2, 
    title: 'Registrierung Schullizenz', 
    type: 'individual', 
    lionColor: 'blue', 
    lionEmoji: '🦁',
    subtasks: [
      'Ich bin bei Fobizz registriert', 
      'Ich habe den Pro-Plan in to-teach.ai'
    ],
    pdfId: 'task2' 
  },
  { 
    id: 3, 
    title: 'Erste Schritte in to-teach.ai', 
    type: 'individual', 
    lionColor: 'green', 
    lionEmoji: '🦁',
    subtasks: [
      'Ich habe ein Youtube-Aufgabenblatt erstellt', 
      'Ich habe eine Powerpoint erstellt', 
      'Ich habe eine Infografik erstellt'
    ],
    pdfId: 'task3' 
  },
  { 
    id: 4, 
    title: 'Gruppenarbeit A', 
    type: 'group', 
    lionColor: 'orange', 
    lionEmoji: '👥',
    subtasks: [
      'Zwischenstandkontrolle in der Gruppe', 
      'Einzellinks sind auf dem Whiteboard festgehalten'
    ],
    whiteboardUrl: 'https://example.com/whiteboard-a'
  },
  { 
    id: 5, 
    title: 'Aufgabenbausteine kennenlernen', 
    type: 'individual', 
    lionColor: 'purple', 
    lionEmoji: '🦁',
    subtasks: [
      'Ich habe den Baustein „Aussagen" erstellt', 
      'Ich habe den Baustein „Mindmap" erstellt', 
      'Ich habe den Baustein „Whatsapp Chat" erstellt'
    ],
    pdfId: 'task5' 
  },
  { 
    id: 6, 
    title: 'Organisation von to-teach.ai-Inhalten', 
    type: 'individual', 
    lionColor: 'yellow', 
    lionEmoji: '🦁',
    subtasks: [
      'Ich habe zwei Ordner erstellt', 
      'Ich habe einen Kurs erstellt'
    ],
    pdfId: 'task6' 
  },
  { 
    id: 7, 
    title: 'Gruppenarbeit B', 
    type: 'group', 
    lionColor: 'teal', 
    lionEmoji: '👥',
    subtasks: [
      'Zwischenstandkontrolle in der Gruppe', 
      'Einzellinks sind auf dem Whiteboard festgehalten'
    ],
    whiteboardUrl: 'https://example.com/whiteboard-b'
  },
  { 
    id: 8, 
    title: 'Gruppenarbeit C', 
    type: 'group', 
    lionColor: 'pink', 
    lionEmoji: '👥',
    subtasks: [
      'Entscheid in der Gruppe, welche Links auf das Padlet kommen', 
      'Mindestens fünf Links mit Begründung'
    ],
    padletUrlEBA: 'https://padlet.com/DLHOrganisation/unsere-to-teach-wand-eba-rnt6ksnune532gbl',
    padletUrlEFZ: 'https://padlet.com/DLHOrganisation/unsere-to-teach-wand-efz-y1dnbn9a2todhlo1'
  }
];

export const RATING_QUESTIONS: RatingQuestion[] = [
  { id: 'enjoyed', label: 'Hat es mir Spaß gemacht?', emoji: '😊' },
  { id: 'useful', label: 'War es sinnvoll?', emoji: '💡' },
  { id: 'learned', label: 'Habe ich etwas gelernt?', emoji: '📚' }
];

export const RATING_OPTIONS: RatingOption[] = [
  { value: 3, label: 'Sehr', emoji: '👍', color: '#4caf50' },
  { value: 2, label: 'Eher ja', emoji: '✔', color: '#8bc34a' },
  { value: 1, label: 'Eher nein', emoji: '✗', color: '#ff9800' },
  { value: 0, label: 'Gar nicht', emoji: '👎', color: '#f44336' }
];

export const generateCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getSubtaskKey = (taskId: number, subtaskIndex: number): string => {
  return `${taskId}-${subtaskIndex}`;
};
