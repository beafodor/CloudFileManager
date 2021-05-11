import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FilePageRoutingModule } from './file-routing.module';

import { FilePage } from './file.page';
import { DropzoneDirective } from 'src/app/directives/dropzone.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FilePageRoutingModule
  ],
  declarations: [FilePage, DropzoneDirective]
})
export class FilePageModule {}
