import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { NotesListPage } from './notes-list.page';

const routes: Routes = [
  {
    path: '',
    component: NotesListPage
  },
  {
    path: 'notes/:chapterKey',
    loadChildren: () => import('./notes/notes.module').then(m => m.NotesPageModule)
  },
  {
    path: 'save-note/:chapterKey/:noteKey',
    loadChildren: () => import('./save-note/save-note.module').then(m => m.SaveNotePageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotesListPageRoutingModule { }
