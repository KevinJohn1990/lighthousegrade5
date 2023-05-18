import { Component, OnInit } from '@angular/core';
import { NotesService } from '../notes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Note, NoteViewModel } from '../note.model';
import { Subscription } from 'rxjs';
import { Chapter } from 'src/app/chapter/chapter.model';
import { ChapterService } from 'src/app/chapter/chapter.service';
import { UtilService } from 'src/app/utils/util.service';
import { AuthService } from 'src/app/auth/auth.service';
import { KNavInfo } from 'src/app/kcomponents/knav/knavInfo.model';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: [
    './notes.page.scss',
    '../../utils/shared.scss'
  ],
})
export class NotesPage {

  isLoading: boolean = false;
  bShowEditOption: boolean = false;
  bShowAsText: boolean = false;
  isAuth: boolean = false;
  notes: NoteViewModel[] = [];
  chapter: Chapter = null;
  notesData: string = "";
  bShowHideAnswer: boolean = false;
  headerTitle: string = "";
  private chapterKey: string = "";

  // Pagination
  startIndex: number;
  endIndex: number;
  total: number = 10;
  bShowPagination: boolean = true;
  pageInterval: number;
  // Pagination end

  chapters: Chapter[];
  searchText: any;
  private notesCountSubs: Subscription = null;
  private notesSearchSubs: Subscription;
  private routeSubs: Subscription = null;
  private notesSubs: Subscription = null;
  private chapterSubs: Subscription = null;
  constructor(
    private activatedRoute: ActivatedRoute,
    private notesService: NotesService,
    private chapterService: ChapterService,
    private router: Router,
    private utilService: UtilService,
    private authService: AuthService
  ) { }

  toggleShow() {
    this.bShowHideAnswer = !this.bShowHideAnswer;
    this.notes.forEach((note) => {
      note.bShowAnswer = this.bShowHideAnswer;
    });
  }

  OpenQuiz() {
    this.router.navigate(['/', 'quiz-list', 'quiz', this.chapterKey]);
  }

  AddNote() {
    const note: Note = {
      id: (this.total + 1),
      answer: "Answer",
      question: "Question",
    }
    this.notesService.addNote(this.chapterKey, note)
      .then(res => {
        this.utilService.presentToast("Blank note added");
        this.total += 1;
      })
      .catch(err => this.utilService.presentToast("Add failed," + err));
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.headerTitle = "Notes";
    this.isAuth = this.authService.isAuthenticated();

    this.pageInterval = this.utilService.getMaxEntriesPerPage();
    this.endIndex = this.pageInterval;
    this.startIndex = 1;
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (paramMap.has("chapterKey")) {
        const chapterKey = paramMap.get("chapterKey");
        this.chapterKey = chapterKey;
        console.log("chapterKey:", chapterKey)
        this.chapterSubs = this.chapterService
          .getChapter(chapterKey)
          .subscribe(chapter => {
            this.chapter = chapter;
            if (chapter != null) {
              this.headerTitle = "Notes: " + this.chapter.id + ". " + this.chapter.title;
            }
          }, err => {
            console.log("Chapter fetch err", err);
          });

        this.notesCountSubs = this.notesService.getTotalNoteCount(chapterKey)
          .subscribe(total => {
            console.log("Total:", total);
            this.total = total;
            if (this.bShowPagination) {
              this.getNotes(this.searchText,this.startIndex, this.endIndex);
            }
          }, err => {
            this.total = 0;
            console.log("Total fetch err:", err);
            this.notes = [];
          });

      } else {
        console.log("Param not found");
        this.isLoading = false;
      }
    }, err => {
      console.log("Error in parammap: ", err);
      this.isLoading = false;
    });
    if (this.isLoading) {
      setTimeout(() => {
        this.isLoading = false;
      }, 3000);
    }
  }

  getNotes(text,start, end) {
    // start = start - 1
    this.searchText = text;
    // console.log("start:", start);
    // console.log("end:", end);
    let search = ""
    this.bShowPagination = true;
    if (this.utilService.isNullOrEmpty(this.searchText) == false) {
      search = this.searchText;
      this.bShowPagination = false;
    }

    this.isLoading = true;
    this.utilService.unSubscribeSubscription(this.notesSearchSubs);
    this.notesSearchSubs = this.notesService.getNotesWithSearch(this.chapterKey, start, end, search)
      .subscribe(data => {
        console.log("Data:", data);
        data.forEach((note) => {
          note.bShowAnswer = this.bShowHideAnswer;
        });
        this.notes = data as NoteViewModel[];
        this.isLoading = false;
      }, err => {
        console.log("Err:", err);
        this.chapters = [];
        this.isLoading = false;
      });
  }

  navOutput(nav: KNavInfo) {
    if (!(this.startIndex == nav.from)) {
      this.startIndex = nav.from;
      this.endIndex = nav.to;
      this.getNotes(this.searchText,this.startIndex, this.endIndex);
    }
  }

  showNoteInText() {
    this.bShowAsText = !this.bShowAsText;
    if (this.bShowAsText) {
      let notesData = "";
      notesData += "Lesson " + this.chapter.id + ": " + this.chapter.title + "\n\n";
      notesData += "Memory Verse: " + this.chapter.memoryVerseRef + "\n";
      notesData += this.chapter.memoryVerse + "\n\n";

      notesData += "Question and Answer\n\n";

      this.notes.forEach(note => {
        notesData += note.question + "\n";
        notesData += note.answer + "\n";
      })
      this.notesData += notesData.trim();
    }
  }

  ionViewWillLeave() {
    this.utilService.unSubscribeSubscription(this.routeSubs);
    this.utilService.unSubscribeSubscription(this.notesSubs);
    this.utilService.unSubscribeSubscription(this.notesSearchSubs);
    this.utilService.unSubscribeSubscription(this.notesCountSubs);
    this.utilService.unSubscribeSubscription(this.chapterSubs);
  }

}