import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotesListPageRoutingModule } from './notes-list-routing.module';

import { NotesListPage } from './notes-list.page';
import { KComponentsModule } from '../kcomponents/kcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotesListPageRoutingModule,
    KComponentsModule
  ],
  declarations: [NotesListPage]
})
export class NotesListPageModule {}
