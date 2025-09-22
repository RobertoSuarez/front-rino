import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../layout/service/layout.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface ThemeOption {
  label: string;
  value: string;
  icon: string;
}

interface FontOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    RadioButtonModule,
    SelectModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private layoutService = inject(LayoutService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  settingsForm!: FormGroup;

  themeOptions: ThemeOption[] = [
    { label: 'Modo Claro', value: 'light', icon: 'pi pi-sun' },
    { label: 'Modo Oscuro', value: 'dark', icon: 'pi pi-moon' },
    { label: 'Sepia', value: 'sepia', icon: 'pi pi-palette' },
    { label: 'Colores Invertidos', value: 'inverted', icon: 'pi pi-circle' }
  ];

  fontOptions: FontOption[] = [
    { label: 'Nunito', value: 'nunito' },
    { label: 'Arial', value: 'arial' },
    { label: 'Times New Roman', value: 'times' },
    { label: 'Lato', value: 'lato' },
    { label: 'Open Dyslexic', value: 'open-dyslexic' },
    { label: 'Predeterminado', value: 'default' }
  ];

  currentFontSize = 16; // Default font size in px

  ngOnInit() {
    console.log('SettingsComponent initialized');
    this.initializeForm();
    this.loadCurrentSettings();
  }

  private initializeForm() {
    this.settingsForm = this.fb.group({
      theme: ['light'],
      fontFamily: ['default'],
      fontSize: [16]
    });
  }

  private loadCurrentSettings() {
    // Load current theme
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    this.settingsForm.patchValue({
      theme: savedTheme
    });

    // Apply the saved theme
    this.layoutService.setThemeMode(savedTheme as 'light' | 'dark' | 'sepia' | 'inverted');

    // Load font settings from localStorage or defaults
    const savedFontFamily = localStorage.getItem('app-font-family') || 'default';
    const savedFontSize = parseInt(localStorage.getItem('app-font-size') || '16');

    this.settingsForm.patchValue({
      fontFamily: savedFontFamily,
      fontSize: savedFontSize
    });

    this.currentFontSize = savedFontSize;
    this.applyFontSettings(savedFontFamily, savedFontSize);
  }

  onThemeChange(theme: string) {
    console.log('Theme changed to:', theme);
    this.layoutService.setThemeMode(theme as 'light' | 'dark' | 'sepia' | 'inverted');

    // Save theme preference
    localStorage.setItem('app-theme', theme);

    this.messageService.add({
      severity: 'success',
      summary: 'Tema actualizado',
      detail: `Se ha aplicado el tema ${this.themeOptions.find(t => t.value === theme)?.label}`
    });
  }

  onFontFamilyChange(fontFamily: string) {
    console.log('Font family changed to:', fontFamily);
    this.applyFontSettings(fontFamily, this.currentFontSize);
    localStorage.setItem('app-font-family', fontFamily);

    this.messageService.add({
      severity: 'success',
      summary: 'Tipo de fuente actualizado',
      detail: `Se ha aplicado la fuente ${this.fontOptions.find(f => f.value === fontFamily)?.label}`
    });
  }

  increaseFontSize() {
    if (this.currentFontSize < 24) {
      this.currentFontSize += 2;
      this.settingsForm.patchValue({ fontSize: this.currentFontSize });
      this.applyFontSettings(this.settingsForm.value.fontFamily, this.currentFontSize);
      localStorage.setItem('app-font-size', this.currentFontSize.toString());

      this.messageService.add({
        severity: 'success',
        summary: 'Tamaño de fuente aumentado',
        detail: `Tamaño actual: ${this.currentFontSize}px`
      });
    }
  }

  decreaseFontSize() {
    if (this.currentFontSize > 12) {
      this.currentFontSize -= 2;
      this.settingsForm.patchValue({ fontSize: this.currentFontSize });
      this.applyFontSettings(this.settingsForm.value.fontFamily, this.currentFontSize);
      localStorage.setItem('app-font-size', this.currentFontSize.toString());

      this.messageService.add({
        severity: 'success',
        summary: 'Tamaño de fuente reducido',
        detail: `Tamaño actual: ${this.currentFontSize}px`
      });
    }
  }

  private applyFontSettings(fontFamily: string, fontSize: number) {
    const root = document.documentElement;

    // Apply font family
    switch (fontFamily) {
      case 'nunito':
        root.style.setProperty('--app-font-family', "'Nunito', sans-serif");
        break;
      case 'arial':
        root.style.setProperty('--app-font-family', 'Arial, sans-serif');
        break;
      case 'times':
        root.style.setProperty('--app-font-family', "'Times New Roman', serif");
        break;
      case 'lato':
        root.style.setProperty('--app-font-family', "'Lato', sans-serif");
        break;
      case 'open-dyslexic':
        root.style.setProperty('--app-font-family', "'OpenDyslexic', sans-serif");
        break;
      default:
        root.style.setProperty('--app-font-family', 'var(--p-font-family)');
        break;
    }

    // Apply font size
    root.style.setProperty('--app-font-size', `${fontSize}px`);
  }

  resetToDefaults() {
    // Reset theme to light
    this.layoutService.setThemeMode('light');

    // Reset font settings
    this.currentFontSize = 16;
    this.settingsForm.patchValue({
      theme: 'light',
      fontFamily: 'default',
      fontSize: 16
    });

    this.applyFontSettings('default', 16);

    // Clear localStorage
    localStorage.removeItem('app-theme');
    localStorage.removeItem('app-font-family');
    localStorage.removeItem('app-font-size');

    this.messageService.add({
      severity: 'info',
      summary: 'Configuración restablecida',
      detail: 'Se han restablecido los valores predeterminados'
    });
  }
}
