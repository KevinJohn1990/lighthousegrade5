import { Injectable, assertPlatform } from '@angular/core';
import { Note, NoteViewModel } from './note.model';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UtilService } from '../utils/util.service';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private jsonFileName: string =
    this.utilService.getAPIBaseEndpoint() + 'notes';
  constructor(
    private db: AngularFireDatabase,
    private utilService: UtilService
  ) {}

  getNote(chapterKey: string, noteKey: string): Observable<NoteViewModel> {
    return this.db
      .object<Note>(`${this.jsonFileName}/${chapterKey}/${noteKey}`)
      .valueChanges()
      .pipe(
        map((note) => {
          var data = note;
          var noteModel: NoteViewModel = {
            id: data.id,
            answer: data.answer,
            chapterKey: chapterKey,
            question: data.question,
            bShowAnswer: false,
            key: noteKey,
          };
          return noteModel;
        })
      );
  }

  getTotalNoteCount(chapterKey: string): Observable<number> {
    let noteList: AngularFireList<Note>;
    noteList = this.db.list<Note>(`${this.jsonFileName}/${chapterKey}`, (ref) =>
      ref.orderByChild('id').limitToLast(1)
    );
    return noteList.valueChanges().pipe(
      first(),
      map((notes: any) => {
        if (notes && notes.length > 0) {
          if (this.utilService.isNumeric(notes[0].id)) {
            return notes[0].id;
          }
        }
        return 0;
      })
    );
  }

  getNotesWithSearch(
    chapterKey: string,
    startIndex: number = 0,
    endIndex: number = 5,
    searchText: string = ''
  ): Observable<NoteViewModel[]> {
    let noteList: AngularFireList<Note>;
    if (
      this.utilService.isNullOrEmpty(searchText) ||
      !this.utilService.isNumeric(searchText)
    ) {
      noteList = this.db.list<Note>(
        `${this.jsonFileName}/${chapterKey}`,
        (ref) => ref.orderByChild('id').startAt(startIndex).endAt(endIndex)
      );
    } else {
      noteList = this.db.list<Note>(
        `${this.jsonFileName}/${chapterKey}`,
        (ref) => ref.orderByChild('id').equalTo(parseInt(searchText))
      );
    }
    return noteList.snapshotChanges().pipe(
      map((notes) => {
        return notes.map((note) => {
          var data = note.payload.val();
          var noteModel: NoteViewModel = {
            id: data.id,
            answer: data.answer,
            chapterKey: chapterKey,
            question: data.question,
            bShowAnswer: false,
            key: note.key,
          };
          return noteModel;
        }) as NoteViewModel[];
      })
    );
  }

  getNotes(chapterKey: string): Observable<NoteViewModel[]> {
    return this.db
      .list<Note>(`${this.jsonFileName}/${chapterKey}`, (ref) =>
        ref.orderByChild('id')
      )
      .snapshotChanges()
      .pipe(
        map((notes: any) => {
          return notes.map((note) => {
            var data = note.payload.val();
            var noteModel: NoteViewModel = {
              id: data.id,
              answer: data.answer,
              chapterKey: chapterKey,
              question: data.question,
              bShowAnswer: false,
              key: note.key,
            };
            return noteModel;
          }) as NoteViewModel[];
        })
      );
  }

  addNote(chapterKey: string, note: Note) {
    return this.db.list(`${this.jsonFileName}/${chapterKey}`).push(note);
  }

  updateNote(chapterKey: string, noteKey: string, note: Note) {
    return this.db
      .object(`${this.jsonFileName}/${chapterKey}/${noteKey}`)
      .update(note);
  }

  deleteNote(chapterKey: string, noteKey: string) {
    return this.db
      .object(`${this.jsonFileName}/${chapterKey}/${noteKey}`)
      .remove();
  }
}
