import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilService } from 'src/app/utils/util.service';
import { Note } from '../note.model';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-save-note',
  templateUrl: './save-note.page.html',
  styleUrls: ['./save-note.page.scss', '../../utils/shared.scss'],
})
export class SaveNotePage {
  isLoading: boolean = false;
  headerTitle: string = '';
  NoteGroup: FormGroup;

  private note: Note;
  private chapterKey: string = '';
  private noteKey: string = '';

  // Subscription
  private activatedRouteSubs: Subscription = null;
  private notesSubs: Subscription = null;

  constructor(
    private utilService: UtilService,
    private noteService: NotesService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute
  ) {
    this.NoteGroup = new FormGroup({
      id: new FormControl('', [Validators.required]),
      question: new FormControl('', [Validators.required]),
      answer: new FormControl('', [Validators.required]),
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.activatedRouteSubs = this.activatedRoute.paramMap.subscribe(
      (params) => {
        if (params.has('chapterKey') && params.has('noteKey')) {
          this.chapterKey = params.get('chapterKey');
          this.noteKey = params.get('noteKey');
          console.log('ch: ', this.chapterKey);
          console.log('nt: ', this.noteKey);
          this.notesSubs = this.noteService
            .getNote(this.chapterKey, this.noteKey)
            .pipe(
              map((data) => {
                const note: Note = {
                  id: data.id,
                  answer: data.answer,
                  question: data.question,
                };
                return note;
              })
            )
            .subscribe(
              (data) => {
                console.log('data:', data);
                const note: Note = data;
                this.setNoteGroup(note);
                this.headerTitle = 'Edit Note: ' + note.id;
                this.isLoading = false;
              },
              (err) => {
                console.log('err:', err);
                this.isLoading = false;
              }
            );
        } else {
          this.isLoading = false;
          console.log('keys were not found');
        }
      }
    );
  }

  ionViewWillLeave() {
    this.utilService.unSubscribeSubscription(this.activatedRouteSubs);
    this.utilService.unSubscribeSubscription(this.notesSubs);
  }

  get question() {
    return this.NoteGroup.get('question');
  }

  get answer() {
    return this.NoteGroup.get('answer');
  }

  save() {
    const note: Note = this.getNoteFromScreen();
    if (this.validateNote(note) == false) {
      return;
    }
    console.log('Note:', note);
    this.noteService
      .updateNote(this.chapterKey, this.noteKey, note)
      .then((res) => {
        this.utilService.presentToast('Update successful');
        // this.navCtrl.pop();
      })
      .catch((err) => this.utilService.presentToast('Update failed, ' + err));
  }

  private validateNote(note: Note): boolean {
    if (this.utilService.isNullOrEmpty(note.id)) {
      this.utilService.presentToast('Kindly enter id');
      return false;
    }
    if (this.utilService.isNumeric(note.id) == false) {
      this.utilService.presentToast('Id should be numeric');
      return false;
    }
    if (this.utilService.isNullOrEmpty(note.question)) {
      this.utilService.presentToast('Kindly enter question');
      return false;
    }
    if (this.utilService.isNullOrEmpty(note.answer)) {
      this.utilService.presentToast('Kindly enter answer');
      return false;
    }
    return true;
  }

  private getNoteFromScreen(): Note {
    let note: Note = this.note;
    note.id = parseInt(this.NoteGroup.get('id').value);
    note.question = this.NoteGroup.get('question').value;
    note.answer = this.NoteGroup.get('answer').value;

    return note;
  }

  private setNoteGroup(note: Note) {
    this.note = note;
    this.NoteGroup.setValue({
      id: note.id,
      question: note.question,
      answer: note.answer,
    });
  }
}
