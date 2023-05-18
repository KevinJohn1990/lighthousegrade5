export class Note {
  id: number;
  question: string;
  answer: string;
  // chapterKey: string; // chapter key
}

export class NoteViewModel {
  id: number;
  question: string;
  answer: string;
  chapterKey: string; //chapter key
  bShowAnswer: boolean;
  key: string; // note key
}
