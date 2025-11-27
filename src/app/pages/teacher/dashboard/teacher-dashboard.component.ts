import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TeacherDashboardService, DashboardStats } from '../../../core/services/teacher-dashboard.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12 gap-4">
      <p-toast></p-toast>

      <!-- Header -->
      <div class="col-span-12">
        <h1 class="text-3xl font-bold text-900 mb-2">Dashboard del Profesor</h1>
        <p class="text-600">Resumen de tu actividad docente y progreso de tus estudiantes</p>
      </div>

      <!-- Loading State -->
      <ng-container *ngIf="loading">
        <div class="col-span-12 md:col-span-6 lg:col-span-3" *ngFor="let i of [1,2,3,4]">
          <p-card>
            <p-skeleton width="100%" height="100px"></p-skeleton>
          </p-card>
        </div>
      </ng-container>

      <!-- Stats Cards -->
      <ng-container *ngIf="!loading && stats">
        <!-- Total Estudiantes -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <p-card styleClass="h-full">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-500 font-medium mb-2">Total Estudiantes</div>
                <div class="text-4xl font-bold text-900">{{ stats.totalStudents }}</div>
              </div>
              <div class="flex items-center justify-center w-16 h-16 bg-blue-100 border-round">
                <i class="pi pi-users text-3xl text-blue-500"></i>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Total Rutas -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <p-card styleClass="h-full">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-500 font-medium mb-2">Rutas de Aprendizaje</div>
                <div class="text-4xl font-bold text-900">{{ stats.totalLearningPaths }}</div>
              </div>
              <div class="flex items-center justify-center w-16 h-16 bg-green-100 border-round">
                <i class="pi pi-sitemap text-3xl text-green-500"></i>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Total Cursos -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <p-card styleClass="h-full">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-500 font-medium mb-2">Cursos Creados</div>
                <div class="text-4xl font-bold text-900">{{ stats.totalCourses }}</div>
              </div>
              <div class="flex items-center justify-center w-16 h-16 bg-orange-100 border-round">
                <i class="pi pi-book text-3xl text-orange-500"></i>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Suscripciones Activas -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <p-card styleClass="h-full">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-500 font-medium mb-2">Suscripciones Activas</div>
                <div class="text-4xl font-bold text-900">{{ stats.activeSubscriptions }}</div>
              </div>
              <div class="flex items-center justify-center w-16 h-16 bg-purple-100 border-round">
                <i class="pi pi-check-circle text-3xl text-purple-500"></i>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Precisión Global (Accuracy) -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <p-card styleClass="h-full">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-500 font-medium mb-2">Precisión Global</div>
                <div class="text-4xl font-bold text-900">{{ stats.averageAccuracy }}%</div>
              </div>
              <div class="flex items-center justify-center w-16 h-16 bg-cyan-100 border-round">
                <i class="pi pi-chart-pie text-3xl text-cyan-500"></i>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Estudiantes en Riesgo -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <p-card styleClass="h-full">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-500 font-medium mb-2">Estudiantes en Riesgo</div>
                <div class="text-4xl font-bold text-red-600">{{ stats.studentsAtRiskCount }}</div>
                <div class="text-sm text-600 mt-1">Precisión < 70%</div>
              </div>
              <div class="flex items-center justify-center w-16 h-16 bg-red-100 border-round">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Gráfico de Distribución de Estudiantes -->
        <div class="col-span-12 lg:col-span-8">
          <p-card>
            <ng-template pTemplate="header">
              <div class="px-6 pt-6">
                <h3 class="text-xl font-bold text-900 mb-1">Distribución de Estudiantes por Ruta</h3>
                <p class="text-600 text-sm">Número de estudiantes en cada ruta de aprendizaje</p>
              </div>
            </ng-template>
            <p-chart 
              *ngIf="chartData" 
              type="bar" 
              [data]="chartData" 
              [options]="chartOptions"
              height="300px">
            </p-chart>
            <div *ngIf="!chartData || stats.studentsByPath.length === 0" class="text-center py-8 text-600">
              <i class="pi pi-chart-bar text-4xl mb-3"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </p-card>
        </div>

        <!-- Precisión General (Gráfico Dona) -->
        <div class="col-span-12 lg:col-span-4">
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="px-6 pt-6">
                <h3 class="text-xl font-bold text-900 mb-1">Precisión General</h3>
                <p class="text-600 text-sm">Promedio de aciertos en actividades</p>
              </div>
            </ng-template>
            <div class="flex flex-column items-center justify-center py-4" *ngIf="pieData">
              <p-chart type="doughnut" [data]="pieData" [options]="pieOptions" width="200px" height="200px"></p-chart>
              <div class="mt-4 text-center">
                <span class="text-3xl font-bold text-900">{{ stats.averageAccuracy }}%</span>
                <div class="text-sm text-600">Precisión Media</div>
              </div>
            </div>
            <div *ngIf="!pieData" class="text-center py-8 text-600">
              <i class="pi pi-chart-pie text-4xl mb-3"></i>
              <p>No hay datos suficientes</p>
            </div>
          </p-card>
        </div>

        <!-- Alertas de Rendimiento (Estudiantes Bajos) -->
        <div class="col-span-12 lg:col-span-6">
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="px-6 pt-6 flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-bold text-900 mb-1">Alertas de Rendimiento</h3>
                  <p class="text-600 text-sm">Estudiantes con precisión baja (< 70%)</p>
                </div>
              </div>
            </ng-template>
            <div class="space-y-3" *ngIf="stats.lowPerformanceStudents && stats.lowPerformanceStudents.length > 0">
              <div 
                *ngFor="let student of stats.lowPerformanceStudents"
                class="flex items-center gap-3 p-3 border-1 surface-border border-round border-left-3 border-red-500">
                <p-avatar 
                  [image]="student.avatar" 
                  [label]="student.name.charAt(0)"
                  shape="circle">
                </p-avatar>
                <div class="flex-1 overflow-hidden">
                  <div class="font-semibold text-900 truncate">{{ student.name }}</div>
                  <div class="text-sm text-red-600 font-medium">Necesita refuerzo</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-red-600">{{ student.averageAccuracy }}%</div>
                  <div class="text-xs text-500">Precisión</div>
                </div>
              </div>
            </div>
            <div *ngIf="!stats.lowPerformanceStudents || stats.lowPerformanceStudents.length === 0" class="text-center py-8 text-600">
              <i class="pi pi-check-circle text-4xl mb-3 text-green-500"></i>
              <p>¡Excelente! No hay estudiantes en riesgo crítico</p>
            </div>
          </p-card>
        </div>

        <!-- Top Rutas de Aprendizaje (Mantenido) -->
        <div class="col-span-12 lg:col-span-6">
          <p-card>
            <ng-template pTemplate="header">
              <div class="px-6 pt-6">
                <h3 class="text-xl font-bold text-900 mb-1">Top Rutas de Aprendizaje</h3>
                <p class="text-600 text-sm">Rutas con más estudiantes suscritos</p>
              </div>
            </ng-template>
            <div class="space-y-3" *ngIf="stats.topLearningPaths.length > 0">
              <div 
                *ngFor="let path of stats.topLearningPaths; let i = index"
                class="flex items-center gap-3 p-3 border-1 surface-border border-round hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-center w-10 h-10 bg-primary text-white border-round font-bold">
                  {{ i + 1 }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-900">{{ path.name }}</div>
                  <div class="text-sm text-600">{{ path.code }}</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-primary">{{ path.studentsCount }}</div>
                  <div class="text-xs text-600">estudiantes</div>
                </div>
              </div>
            </div>
            <div *ngIf="stats.topLearningPaths.length === 0" class="text-center py-8 text-600">
              <i class="pi pi-inbox text-4xl mb-3"></i>
              <p>No hay rutas creadas aún</p>
            </div>
          </p-card>
        </div>

        <!-- Estudiantes Recientes -->
        <div class="col-span-12 lg:col-span-6">
          <p-card>
            <ng-template pTemplate="header">
              <div class="px-6 pt-6 flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-bold text-900 mb-1">Estudiantes Recientes</h3>
                  <p class="text-600 text-sm">Últimas suscripciones a tus rutas</p>
                </div>
                <button 
                  pButton 
                  label="Ver Todos" 
                  icon="pi pi-arrow-right" 
                  class="p-button-text p-button-sm"
                  (click)="viewAllStudents()">
                </button>
              </div>
            </ng-template>
            <div class="space-y-3" *ngIf="stats.recentStudents.length > 0">
              <div 
                *ngFor="let student of stats.recentStudents"
                class="flex items-center gap-3 p-3 border-1 surface-border border-round">
                <p-avatar 
                  [image]="student.urlAvatar" 
                  [label]="student.firstName.charAt(0) + student.lastName.charAt(0)"
                  size="large" 
                  shape="circle">
                </p-avatar>
                <div class="flex-1">
                  <div class="font-semibold text-900">{{ student.firstName }} {{ student.lastName }}</div>
                  <div class="text-sm text-600">{{ student.pathName }}</div>
                  <div class="text-xs text-500">{{ student.subscribedAt }}</div>
                </div>
              </div>
            </div>
            <div *ngIf="stats.recentStudents.length === 0" class="text-center py-8 text-600">
              <i class="pi pi-users text-4xl mb-3"></i>
              <p>No hay estudiantes suscritos aún</p>
            </div>
          </p-card>
        </div>

        <!-- Cursos Recientes -->
        <div class="col-span-12 lg:col-span-6">
          <p-card>
            <ng-template pTemplate="header">
              <div class="px-6 pt-6 flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-bold text-900 mb-1">Cursos Recientes</h3>
                  <p class="text-600 text-sm">Últimos cursos que has creado</p>
                </div>
                <button 
                  pButton 
                  label="Ver Todos" 
                  icon="pi pi-arrow-right" 
                  class="p-button-text p-button-sm"
                  (click)="viewAllCourses()">
                </button>
              </div>
            </ng-template>
            <div class="space-y-3" *ngIf="stats.recentCourses.length > 0">
              <div 
                *ngFor="let course of stats.recentCourses"
                class="flex items-center gap-3 p-3 border-1 surface-border border-round hover:bg-gray-50 transition-colors cursor-pointer"
                (click)="goToCourse(course.id)">
                <img 
                  *ngIf="course.urlLogo" 
                  [src]="course.urlLogo" 
                  [alt]="course.title"
                  class="w-12 h-12 border-round"
                  style="object-fit: cover;">
                <div class="flex-1">
                  <div class="font-semibold text-900">{{ course.title }}</div>
                  <div class="text-sm text-600">{{ course.code }}</div>
                  <div class="text-xs text-500">{{ course.createdAt }}</div>
                </div>
                <p-tag 
                  [value]="course.chaptersCount + ' cap.'" 
                  severity="info">
                </p-tag>
              </div>
            </div>
            <div *ngIf="stats.recentCourses.length === 0" class="text-center py-8 text-600">
              <i class="pi pi-book text-4xl mb-3"></i>
              <p>No hay cursos creados aún</p>
            </div>
          </p-card>
        </div>
      </ng-container>
    </div>
  `
})
export class TeacherDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  chartData: any;
  chartOptions: any;
  pieData: any;
  pieOptions: any;

  constructor(
    private dashboardService: TeacherDashboardService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las estadísticas del dashboard'
        });
        this.loading = false;
      }
    });
  }

  prepareChartData(): void {
    if (!this.stats) return;

    // Gráfico de Barras (Estudiantes por Ruta)
    if (this.stats.studentsByPath.length > 0) {
      this.chartData = {
        labels: this.stats.studentsByPath.map(item => item.pathName),
        datasets: [
          {
            label: 'Estudiantes',
            data: this.stats.studentsByPath.map(item => item.count),
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
            borderWidth: 1
          }
        ]
      };
    } else {
      this.chartData = null;
    }

    // Gráfico de Dona (Precisión)
    const accuracy = this.stats.averageAccuracy || 0;
    this.pieData = {
      labels: ['Precisión', 'Margen de Mejora'],
      datasets: [
        {
          data: [accuracy, 100 - accuracy],
          backgroundColor: ['#06b6d4', '#e5e7eb'], // Cyan-500 y Gray-200
          hoverBackgroundColor: ['#0891b2', '#d1d5db']
        }
      ]
    };
  }

  initChartOptions(): void {
    // Opciones Barras
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    // Opciones Dona
    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: '#4b5563'
          }
        }
      }
    };
  }

  goToPath(pathId: number): void {
    this.router.navigate(['/admin/learning-paths', pathId]);
  }

  goToCourse(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  viewAllStudents(): void {
    this.router.navigate(['/teacher/students']);
  }

  viewAllCourses(): void {
    this.router.navigate(['/courses']);
  }
}
