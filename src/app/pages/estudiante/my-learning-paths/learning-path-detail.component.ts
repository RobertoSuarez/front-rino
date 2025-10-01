import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


import { LearningPathService } from '../../../core/services/learning-path.service';

@Component({
  selector: 'app-learning-path-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    ChipModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    SkeletonModule,
    DividerModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12 gap-4">
      <p-toast></p-toast>

      <!-- Botón de regreso -->
      <div class="col-span-12">
        <button 
          pButton 
          label="Volver a Mis Rutas" 
          icon="pi pi-arrow-left" 
          class="p-button-text"
          (click)="goBack()">
        </button>
      </div>

      <!-- Loading State -->
      <ng-container *ngIf="loading">
        <div class="col-span-12">
          <p-card>
            <p-skeleton width="100%" height="200px"></p-skeleton>
            <p-skeleton width="80%" height="2rem" styleClass="mt-4"></p-skeleton>
            <p-skeleton width="60%" height="1rem" styleClass="mt-2"></p-skeleton>
          </p-card>
        </div>
      </ng-container>

      <!-- Contenido -->
      <ng-container *ngIf="!loading && pathDetail">
        <!-- Header de la Ruta -->
        <div class="col-span-12">
          <p-card>
            <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-6 -m-6 mb-4 text-white rounded-t-lg">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h1 class="text-3xl font-bold mb-2">{{ pathDetail.name }}</h1>
                  <p class="text-lg opacity-90 font-mono">{{ pathDetail.code }}</p>
                </div>
                <p-tag 
                  [value]="pathDetail.isActive ? 'Activo' : 'Inactivo'" 
                  [severity]="pathDetail.isActive ? 'success' : 'danger'"
                  styleClass="text-lg">
                </p-tag>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h3 class="text-xl font-semibold text-900 mb-2">Descripción</h3>
                <p class="text-600">{{ pathDetail.description }}</p>
              </div>

              <p-divider></p-divider>

              <!-- Información del Profesor -->
              <div *ngIf="pathDetail.createdBy">
                <h3 class="text-lg font-semibold text-900 mb-3">Profesor</h3>
                <div class="flex items-center gap-3">
                  <p-avatar 
                    [image]="pathDetail.createdBy.urlAvatar" 
                    [label]="pathDetail.createdBy.firstName.charAt(0) + pathDetail.createdBy.lastName.charAt(0)"
                    size="large" 
                    shape="circle">
                  </p-avatar>
                  <div>
                    <div class="font-semibold text-900">
                      {{ pathDetail.createdBy.firstName }} {{ pathDetail.createdBy.lastName }}
                    </div>
                    <div class="text-sm text-600">Creador de la ruta</div>
                  </div>
                </div>
              </div>

              <p-divider></p-divider>

              <!-- Estadísticas -->
              <div>
                <h3 class="text-lg font-semibold text-900 mb-3">Estadísticas</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="text-center p-3 bg-blue-50 border-round">
                    <i class="pi pi-book text-3xl text-blue-500 mb-2"></i>
                    <div class="text-2xl font-bold text-900">{{ pathDetail.courses?.length || 0 }}</div>
                    <div class="text-sm text-600">Cursos</div>
                  </div>
                  <div class="text-center p-3 bg-green-50 border-round">
                    <i class="pi pi-bookmark text-3xl text-green-500 mb-2"></i>
                    <div class="text-2xl font-bold text-900">{{ getTotalChapters() }}</div>
                    <div class="text-sm text-600">Capítulos</div>
                  </div>
                  <div class="text-center p-3 bg-orange-50 border-round">
                    <i class="pi pi-list text-3xl text-orange-500 mb-2"></i>
                    <div class="text-2xl font-bold text-900">{{ getTotalTemas() }}</div>
                    <div class="text-sm text-600">Temas</div>
                  </div>
                  <div class="text-center p-3 bg-purple-50 border-round">
                    <i class="pi pi-users text-3xl text-purple-500 mb-2"></i>
                    <div class="text-2xl font-bold text-900">{{ pathDetail.studentsCount || 0 }}</div>
                    <div class="text-sm text-600">Estudiantes</div>
                  </div>
                </div>
              </div>

              <p-divider></p-divider>

              <!-- Estudiantes Suscritos -->
              <div *ngIf="pathDetail.students && pathDetail.students.length > 0">
                <h3 class="text-lg font-semibold text-900 mb-3">
                  Compañeros en esta ruta ({{ pathDetail.studentsCount }})
                </h3>
                <p-avatarGroup>
                  <p-avatar 
                    *ngFor="let student of pathDetail.students"
                    [image]="student.urlAvatar"
                    [label]="student.firstName.charAt(0) + student.lastName.charAt(0)"
                    shape="circle"
                    [pTooltip]="student.firstName + ' ' + student.lastName"
                    tooltipPosition="top">
                  </p-avatar>
                  <p-avatar 
                    *ngIf="pathDetail.studentsCount > pathDetail.students.length"
                    [label]="'+' + (pathDetail.studentsCount - pathDetail.students.length)"
                    shape="circle"
                    [style]="{'background-color':'#9c27b0', 'color': '#ffffff'}">
                  </p-avatar>
                </p-avatarGroup>
              </div>

              <!-- Fechas -->
              <div class="grid grid-cols-2 gap-4 text-sm text-600">
                <div>
                  <i class="pi pi-calendar mr-2"></i>
                  <strong>Creado:</strong> {{ pathDetail.createdAt }}
                </div>
                <div>
                  <i class="pi pi-clock mr-2"></i>
                  <strong>Actualizado:</strong> {{ pathDetail.updatedAt }}
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Cursos y Contenido -->
        <div class="col-span-12">
          <p-card>
            <ng-template pTemplate="header">
              <div class="px-6 pt-6">
                <h2 class="text-2xl font-bold text-900 mb-2">Contenido de la Ruta</h2>
                <p class="text-600">Explora todos los cursos, capítulos y temas incluidos en esta ruta</p>
              </div>
            </ng-template>

            <div *ngIf="pathDetail.courses && pathDetail.courses.length > 0" class="space-y-4">
              <div *ngFor="let course of pathDetail.courses; let i = index" class="border-1 surface-border border-round">
                <!-- Header del Curso -->
                <div 
                  class="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  (click)="toggleCourse(i)">
                  <img 
                    *ngIf="course.urlLogo" 
                    [src]="course.urlLogo" 
                    [alt]="course.title"
                    class="w-12 h-12 border-round"
                    style="object-fit: cover;">
                  <div class="flex-1">
                    <div class="font-semibold text-900">{{ course.title }}</div>
                    <div class="text-sm text-600">{{ course.code }}</div>
                  </div>
                  <p-chip 
                    [label]="course.chaptersCount + ' capítulo' + (course.chaptersCount !== 1 ? 's' : '')" 
                    styleClass="text-sm">
                  </p-chip>
                  <i [class]="expandedCourses[i] ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-600"></i>
                </div>

                <!-- Contenido del Curso -->
                <div *ngIf="expandedCourses[i]" class="p-4 border-top-1 surface-border">
                  <div class="space-y-3">
                    <p class="text-600 mb-4">{{ course.description }}</p>

                    <!-- Capítulos -->
                    <div *ngIf="course.chapters && course.chapters.length > 0">
                      <h4 class="font-semibold text-900 mb-3">Capítulos</h4>
                      <div class="space-y-3">
                        <div 
                          *ngFor="let chapter of course.chapters; let chapterIndex = index"
                          class="border-1 surface-border border-round p-3">
                          <div class="flex items-start gap-3">
                            <div class="flex items-center justify-center w-8 h-8 bg-primary text-white border-round font-semibold">
                              {{ chapterIndex + 1 }}
                            </div>
                            <div class="flex-1">
                              <div class="font-semibold text-900 mb-2">{{ chapter.title }}</div>
                              <div class="text-sm text-600 mb-2">
                                {{ chapter.temasCount }} tema{{ chapter.temasCount !== 1 ? 's' : '' }}
                              </div>

                              <!-- Temas -->
                              <div *ngIf="chapter.temas && chapter.temas.length > 0" class="space-y-2">
                                <div 
                                  *ngFor="let tema of chapter.temas"
                                  class="flex items-center gap-2 p-2 bg-gray-50 border-round">
                                  <i class="pi pi-book text-sm text-primary"></i>
                                  <span class="text-sm flex-1">{{ tema.title }}</span>
                                  <p-chip 
                                    [label]="tema.activitiesCount + ' actividad' + (tema.activitiesCount !== 1 ? 'es' : '')" 
                                    styleClass="text-xs"
                                    icon="pi pi-check-square">
                                  </p-chip>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div *ngIf="!course.chapters || course.chapters.length === 0" class="text-center py-4 text-600">
                      <i class="pi pi-info-circle mr-2"></i>
                      Este curso aún no tiene capítulos disponibles
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!pathDetail.courses || pathDetail.courses.length === 0" class="text-center py-8">
              <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
              <p class="text-600">Esta ruta aún no tiene cursos asignados</p>
            </div>
          </p-card>
        </div>
      </ng-container>
    </div>
  `
})
export class LearningPathDetailComponent implements OnInit {
  pathDetail: any = null;
  loading = false;
  pathId: number = 0;
  expandedCourses: { [key: number]: boolean } = {};

  constructor(
    private learningPathService: LearningPathService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pathId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    if (this.pathId) {
      this.loadPathDetail();
    }
  }

  toggleCourse(index: number): void {
    this.expandedCourses[index] = !this.expandedCourses[index];
  }

  loadPathDetail(): void {
    this.loading = true;
    this.learningPathService.getPathDetail(this.pathId).subscribe({
      next: (response) => {
        this.pathDetail = response.data;
        // Expandir el primer curso por defecto
        if (this.pathDetail.courses && this.pathDetail.courses.length > 0) {
          this.expandedCourses[0] = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo cargar el detalle de la ruta'
        });
        this.loading = false;
        this.router.navigate(['/estudiante/my-learning-paths']);
      }
    });
  }

  getTotalChapters(): number {
    if (!this.pathDetail?.courses) return 0;
    return this.pathDetail.courses.reduce((total: number, course: any) => 
      total + (course.chaptersCount || 0), 0
    );
  }

  getTotalTemas(): number {
    if (!this.pathDetail?.courses) return 0;
    return this.pathDetail.courses.reduce((total: number, course: any) => {
      if (!course.chapters) return total;
      return total + course.chapters.reduce((sum: number, chapter: any) => 
        sum + (chapter.temasCount || 0), 0
      );
    }, 0);
  }

  goBack(): void {
    this.router.navigate(['/estudiante/my-learning-paths']);
  }
}
