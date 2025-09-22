import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StudentChatComponent } from './student-chat.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: StudentChatComponent }
    ])
  ]
})
export class StudentChatModule { }
