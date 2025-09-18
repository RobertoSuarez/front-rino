import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// @ts-ignore
import { marked } from 'marked';

@Pipe({
  name: 'markdownToHtml',
  standalone: true
})
export class MarkdownToHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Configurar marked para manejar código y otros elementos
    const options = {
      gfm: true,
      breaks: true,
      smartLists: true,
      smartypants: true,
      xhtml: true
    };
    
    const html = marked(value, options);
    return this.sanitizer.bypassSecurityTrustHtml(html as string);
  }
}
