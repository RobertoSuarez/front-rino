import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface Class {
  id: number;
  name: string;
  description: string;
  teacher: string;
  subject: string;
  code: string;
  studentsCount: number;
  schedule?: string;
  color?: string;
  // Additional details for modal
  objectives?: string[];
  requirements?: string[];
  duration?: string;
  difficulty?: 'Principiante' | 'Intermedio' | 'Avanzado';
  topics?: string[];
  resources?: string[];
}

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    MenuModule,
    ConfirmDialogModule
  ],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ClassesComponent implements OnInit {
  classes: Class[] = [];
  showJoinDialog = false;
  classCode = '';
  isLoading = false;
  isJoining = false;
  showDetailsDialog = false;
  selectedClass: Class | null = null;
  menuItems: any[] = [];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    console.log('ClassesComponent initialized');
    this.loadClasses();
  }

  private loadClasses() {
    this.isLoading = true;

    // Mock data - replace with actual API call
    // Temporarily remove setTimeout to test immediate loading
    this.classes = [
      {
        id: 1,
        name: 'Introducción a la Ciberseguridad',
        description: 'Aprende los conceptos básicos de la seguridad en internet y cómo proteger tus datos personales',
        teacher: 'Prof. Carlos Mendoza',
        subject: 'Ciberseguridad',
        code: 'CYBER101',
        studentsCount: 28,
        schedule: 'Lunes y Miércoles 14:00-15:30',
        color: '#4CAF50',
        objectives: [
          'Comprender los conceptos básicos de ciberseguridad',
          'Identificar amenazas comunes en internet',
          'Aprender a proteger información personal'
        ],
        requirements: [
          'Conocimientos básicos de computación',
          'Acceso a internet',
          'Interés por la seguridad digital'
        ],
        duration: '8 semanas',
        difficulty: 'Principiante',
        topics: [
          '¿Qué es la ciberseguridad?',
          'Tipos de amenazas en línea',
          'Protección de contraseñas',
          'Navegación segura'
        ],
        resources: [
          'Manual digital de ciberseguridad',
          'Videos educativos interactivos',
          'Ejercicios prácticos online'
        ]
      },
      {
        id: 2,
        name: 'Navegación Segura en Internet',
        description: 'Descubre cómo identificar sitios web seguros y evitar peligros en línea',
        teacher: 'Prof. Ana García',
        subject: 'Ciberseguridad',
        code: 'WEBSEC2024',
        studentsCount: 22,
        schedule: 'Martes y Jueves 10:00-11:30',
        color: '#2196F3',
        objectives: [
          'Identificar sitios web seguros',
          'Reconocer enlaces peligrosos',
          'Aprender a navegar de forma segura'
        ],
        requirements: [
          'Conocimientos básicos de navegación web',
          'Acceso a internet supervisado',
          'Curiosidad por aprender'
        ],
        duration: '6 semanas',
        difficulty: 'Principiante',
        topics: [
          'Certificados de seguridad HTTPS',
          'Phishing y cómo evitarlo',
          'Extensiones de navegador útiles',
          'Búsqueda segura en Google'
        ],
        resources: [
          'Guía de navegación segura',
          'Simulador de phishing',
          'Lista de herramientas recomendadas'
        ]
      },
      {
        id: 3,
        name: 'Protege tu Información Personal',
        description: 'Aprende a crear contraseñas seguras y mantener privada tu información en redes sociales',
        teacher: 'Prof. Roberto Silva',
        subject: 'Ciberseguridad',
        code: 'PRIVACY2024',
        studentsCount: 31,
        schedule: 'Viernes 09:00-10:30',
        color: '#FF9800',
        objectives: [
          'Crear contraseñas seguras y únicas',
          'Configurar la privacidad en redes sociales',
          'Entender la importancia de la privacidad digital'
        ],
        requirements: [
          'Tener cuentas en redes sociales',
          'Conocimientos básicos de configuración',
          'Interés por la privacidad'
        ],
        duration: '10 semanas',
        difficulty: 'Intermedio',
        topics: [
          'Creación de contraseñas fuertes',
          'Gestores de contraseñas',
          'Configuración de privacidad en Instagram, TikTok y Snapchat',
          'Compartir información de forma segura'
        ],
        resources: [
          'Generador de contraseñas',
          'Guías de configuración de privacidad',
          'Plantillas de políticas de privacidad'
        ]
      }
    ];
    this.isLoading = false;
  }

  openJoinDialog() {
    this.showJoinDialog = true;
    this.classCode = '';
  }

  closeJoinDialog() {
    this.showJoinDialog = false;
    this.classCode = '';
  }

  joinClass() {
    if (!this.classCode.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor ingresa un código de clase'
      });
      return;
    }

    this.isJoining = true;

    // Mock API call - replace with actual service
    setTimeout(() => {
      // Simulate successful join
      this.messageService.add({
        severity: 'success',
        summary: '¡Éxito!',
        detail: 'Te has unido a la clase exitosamente'
      });

      this.closeJoinDialog();
      this.loadClasses(); // Refresh the list
      this.isJoining = false;
    }, 1500);
  }

  leaveClass(classId: number) {
    const classItem = this.classes.find(c => c.id === classId);
    if (classItem) {
      this.confirmLeaveClass(classItem);
    }
  }

  getClassIcon(subject: string): string {
    const icons: { [key: string]: string } = {
      'Ciberseguridad': 'pi pi-shield',
      'default': 'pi pi-book'
    };
    return icons[subject] || icons['default'];
  }

  viewClassDetails(classItem: Class) {
    this.selectedClass = classItem;
    this.showDetailsDialog = true;
  }

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedClass = null;
  }

  showOptionsMenu(event: Event, classItem: Class) {
    this.menuItems = [
      {
        label: 'Ver Detalles',
        icon: 'pi pi-eye',
        command: () => this.viewClassDetails(classItem)
      },
      {
        label: 'Marcar como Favorita',
        icon: 'pi pi-star',
        command: () => this.markAsFavorite(classItem)
      },
      {
        label: 'Salir de la Clase',
        icon: 'pi pi-sign-out',
        command: () => this.confirmLeaveClass(classItem)
      }
    ];

    // Note: In a real implementation, you'd use a menu component here
    // For now, we'll directly call the first option as an example
    this.viewClassDetails(classItem);
  }

  markAsFavorite(classItem: Class) {
    this.messageService.add({
      severity: 'success',
      summary: '¡Favorita!',
      detail: `"${classItem.name}" ha sido marcada como favorita`
    });
  }

  confirmLeaveClass(classItem: Class) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres salir de la clase "${classItem.name}"?`,
      header: 'Confirmar Salida',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, salir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined p-button-sm',
      accept: () => {
        this.classes = this.classes.filter(c => c.id !== classItem.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Saliste de la clase',
          detail: `Has abandonado "${classItem.name}" exitosamente`
        });
      },
      reject: () => {
        // User cancelled, do nothing
      }
    });
  }
}
