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
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';


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
    BreadcrumbModule
  ],
  providers: [MessageService],
  templateUrl: './learning-path-detail.component.html',
  styleUrl: './learning-path-detail.component.css'
})
export class LearningPathDetailComponent implements OnInit {
  pathDetail: any = null;
  loading = false;
  pathId: number = 0;
  expandedCourses: { [key: number]: boolean } = {};
  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem | undefined;

  constructor(
    private learningPathService: LearningPathService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.breadcrumbItems = [
      { label: 'Mis Rutas', routerLink: '/estudiante/my-learning-paths' },
      { label: 'Detalle de la Ruta' }
    ];
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

  navigateToTema(cursoId: number, chapterId: number): void {
    this.router.navigate(['/estudiante/cursos', cursoId, 'chapters', chapterId, 'temas']);
  }

  goBack(): void {
    this.router.navigate(['/estudiante/my-learning-paths']);
  }
}
