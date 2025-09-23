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
  hasUnsavedChanges = false;

  themeOptions: ThemeOption[] = [
    { label: 'Modo Claro', value: 'light', icon: 'pi pi-sun' },
    { label: 'Modo Oscuro', value: 'dark', icon: 'pi pi-moon' },
    { label: 'Sepia', value: 'sepia', icon: 'pi pi-palette' },
    { label: 'Alto Contraste', value: 'inverted', icon: 'pi pi-circle' }
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

  get currentFontLabel(): string {
    return this.fontOptions.find(f => f.value === this.settingsForm.value.fontFamily)?.label || 'Lato';  // Changed from 'Predeterminado' to 'Lato'
  }

  getThemeDescription(theme: string): string {
    const descriptions = {
      'light': 'Interfaz clara y brillante',
      'dark': 'Interfaz oscura para reducir fatiga visual',
      'sepia': 'Tonos cálidos para lectura cómoda',
      'inverted': 'Máximo contraste para accesibilidad'
    };
    return descriptions[theme as keyof typeof descriptions] || '';
  }

  getThemePreviewClass(theme: string): string {
    const classes = {
      'light': 'bg-white text-gray-800',
      'dark': 'bg-gray-800 text-white',
      'sepia': 'bg-yellow-50 text-yellow-900',
      'inverted': 'bg-white text-black border-2 border-black'
    };
    return classes[theme as keyof typeof classes] || 'bg-white text-gray-800';
  }

  getFontFamily(fontValue: string): string {
    const fontFamilies = {
      'nunito': 'Nunito, sans-serif',
      'arial': 'Arial, sans-serif',
      'times': 'Times New Roman, serif',
      'lato': 'Lato, sans-serif',
      'open-dyslexic': 'OpenDyslexic, sans-serif',
      'default': 'var(--p-font-family)'
    };
    return fontFamilies[fontValue as keyof typeof fontFamilies] || 'var(--p-font-family)';
  }

  getFontDescription(fontValue: string): string {
    const descriptions = {
      'nunito': 'Fuente moderna y legible',
      'arial': 'Clásica fuente sans-serif',
      'times': 'Fuente serif tradicional',
      'lato': 'Fuente humanista elegante',
      'open-dyslexic': 'Diseñada para dislexia',
      'default': 'Fuente del sistema'
    };
    return descriptions[fontValue as keyof typeof descriptions] || '';
  }

  getCurrentFontFamily(): string {
    return this.getFontFamily(this.settingsForm.value.fontFamily || 'lato');  // Changed default from 'default' to 'lato'
  }

  ngOnInit() {
    console.log('SettingsComponent initialized');
    this.initializeForm();
    this.loadCurrentSettings();
    this.setupChangeDetection();
  }

  private setupChangeDetection() {
    // Detect changes in form to show unsaved changes indicator
    // Wait a bit for form initialization before listening to changes
    setTimeout(() => {
      this.settingsForm.valueChanges.subscribe(() => {
        this.hasUnsavedChanges = true;
      });
    }, 100);
  }

  private initializeForm() {
    this.settingsForm = this.fb.group({
      theme: ['light'],
      fontFamily: ['lato'],  // Changed default from 'default' to 'lato'
      fontSize: [16]
    });
  }

  private loadCurrentSettings() {
    // Load current theme
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    
    // Load font settings from localStorage or defaults
    let savedFontFamily = localStorage.getItem('app-font-family') || 'lato';  // Changed default to 'lato'

    // Check if the saved font is available, if not reset to lato
    if (!this.fontOptions.find(f => f.value === savedFontFamily)) {
      console.warn(`Font ${savedFontFamily} not available, resetting to lato`);
      savedFontFamily = 'lato';
      localStorage.removeItem('app-font-family'); // Remove invalid font from storage
    }

    const savedFontSize = parseInt(localStorage.getItem('app-font-size') || '16');

    // Update form with loaded values
    this.settingsForm.patchValue({
      theme: savedTheme,
      fontFamily: savedFontFamily,
      fontSize: savedFontSize
    });

    // Apply the saved theme immediately
    this.layoutService.setThemeMode(savedTheme as 'light' | 'dark' | 'sepia' | 'inverted');

    // Apply font settings
    this.currentFontSize = savedFontSize;
    this.applyFontSettings(savedFontFamily, savedFontSize);
    
    // Reset unsaved changes flag after loading
    setTimeout(() => {
      this.hasUnsavedChanges = false;
    }, 200);
  }

  onThemeChange(theme: string) {
    console.log('Theme changed to:', theme);
    
    // Update form control
    this.settingsForm.patchValue({ theme: theme }, { emitEvent: false });
    
    // Apply theme immediately
    this.layoutService.setThemeMode(theme as 'light' | 'dark' | 'sepia' | 'inverted');
    
    // Mark as having unsaved changes
    this.hasUnsavedChanges = true;
  }

  onFontFamilyChange(fontFamily: string) {
    console.log('Font family changed to:', fontFamily);
    
    // Update form control
    this.settingsForm.patchValue({ fontFamily: fontFamily }, { emitEvent: false });
    
    // Apply font settings immediately for preview
    this.applyFontSettings(fontFamily, this.currentFontSize);
    
    // Mark as having unsaved changes
    this.hasUnsavedChanges = true;
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

  saveSettings() {
    // Save all current settings to localStorage
    const currentSettings = this.settingsForm.value;

    localStorage.setItem('app-theme', currentSettings.theme);
    localStorage.setItem('app-font-family', currentSettings.fontFamily);
    localStorage.setItem('app-font-size', currentSettings.fontSize.toString());

    // Apply settings
    this.layoutService.setThemeMode(currentSettings.theme as 'light' | 'dark' | 'sepia' | 'inverted');
    this.applyFontSettings(currentSettings.fontFamily, currentSettings.fontSize);

    // Reset unsaved changes flag
    this.hasUnsavedChanges = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Configuración guardada',
      detail: 'Todos los cambios han sido aplicados y guardados'
    });
  }

  resetToDefaults() {
    // Reset theme to light
    this.layoutService.setThemeMode('light');

    // Reset font settings to defaults (lato instead of default)
    this.currentFontSize = 16;
    this.settingsForm.patchValue({
      theme: 'light',
      fontFamily: 'lato',  // Changed from 'default' to 'lato'
      fontSize: 16
    });

    this.applyFontSettings('lato', 16);  // Changed from 'default' to 'lato'

    // Clear localStorage
    localStorage.removeItem('app-theme');
    localStorage.removeItem('app-font-family');
    localStorage.removeItem('app-font-size');

    // Reset unsaved changes flag
    this.hasUnsavedChanges = false;

    this.messageService.add({
      severity: 'info',
      summary: 'Configuración restablecida',
      detail: 'Se han restablecido los valores predeterminados'
    });
  }
}
