import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SaveNotePageRoutingModule } from './save-note-routing.module';

import { SaveNotePage } from './save-note.page';
import { KComponentsModule } from 'src/app/kcomponents/kcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SaveNotePageRoutingModule,
    KComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [SaveNotePage]
})
export class SaveNotePageModule { }
