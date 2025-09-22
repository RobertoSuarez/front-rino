import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownToHtmlPipe } from './pipes/markdown-to-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    MarkdownToHtmlPipe
  ],
  exports: [
    MarkdownToHtmlPipe
  ]
})
export class SharedModule { }
