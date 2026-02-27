import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from './app/layout/service/layout.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
    private layoutService = inject(LayoutService);

    ngOnInit(): void {
        if (typeof window === 'undefined') {
            return;
        }

        const savedTheme = localStorage.getItem('app-theme') || 'light';
        const validTheme = ['light', 'dark', 'sepia', 'inverted'].includes(savedTheme) ? savedTheme : 'light';
        this.layoutService.setThemeMode(validTheme as 'light' | 'dark' | 'sepia' | 'inverted');

        const root = document.documentElement;
        const savedFontSize = parseInt(localStorage.getItem('app-font-size') || '16', 10);
        root.style.setProperty('--app-font-size', `${Number.isFinite(savedFontSize) ? savedFontSize : 16}px`);

        const savedFontFamily = localStorage.getItem('app-font-family') || 'lato';
        const fontFamilyMap: Record<string, string> = {
            nunito: "'Nunito', sans-serif",
            arial: 'Arial, sans-serif',
            times: "'Times New Roman', serif",
            lato: "'Lato', sans-serif",
            'open-dyslexic': "'OpenDyslexic', sans-serif",
            default: 'var(--p-font-family)'
        };
        root.style.setProperty('--app-font-family', fontFamilyMap[savedFontFamily] || fontFamilyMap['lato']);
    }
}
