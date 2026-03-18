import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Table } from 'primeng/table';
import { ActivityService } from '../../../core/services/activity.service';
import { TemaService } from '../../../core/services/tema.service';
import { Activity } from '../../../core/models/activity.interface';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from "primeng/button";
import { environment } from 'src/environments/environment';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [
    TableModule,
    ToastModule,
    CommonModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DialogModule,
    CheckboxModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    BreadcrumbModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './activities-list.component.html',
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivitiesListComponent implements OnInit {
  activities: Activity[] = [];
  loading: boolean = true;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  currentActivityId: number | null = null;
  activityForm: FormGroup;
  temaId: number | null = null;
  temaInfo: any = null;
  courseId: number | null = null;
  chapterId: number | null = null;

  breadcrumbItems: any[] = [];
  breadcrumbHome = { label: 'Panel principal', icon: 'pi pi-home', routerLink: '/dashboard' };

  @ViewChild('dt') dt!: Table;

  constructor(
    private activityService: ActivityService,
    private temaService: TemaService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.activityForm = this.createForm();
  }

  ngOnInit() {
    // Verificar si hay parámetros en la URL
    this.route.queryParams.subscribe(params => {
      const temaId = params['temaId'];
      
      if (temaId) {
        this.temaId = parseInt(temaId, 10);
        this.courseId = params['courseId'] ? parseInt(params['courseId'], 10) : null;
        this.chapterId = params['chapterId'] ? parseInt(params['chapterId'], 10) : null;
        this.loadTemaInfo();
        this.loadActivities();
        this.updateBreadcrumbs();
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se ha especificado un tema'
        });
      }
    });
  }

  /**
   * Carga la información del tema seleccionado
   */
  loadTemaInfo() {
    if (!this.temaId) return;
    
    this.loading = true;
    this.temaService.getTemaById(this.temaId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.temaInfo = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar información del tema', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la información del tema'
        });
        this.loading = false;
      }
    });
  }

  updateBreadcrumbs() {
    this.breadcrumbItems = [
      { label: 'Cursos', routerLink: '/admin/courses' }
    ];

    if (this.courseId) {
      this.breadcrumbItems.push({
        label: 'Capítulos',
        routerLink: '/admin/chapters',
        queryParams: { courseId: this.courseId }
      });
    }

    if (this.courseId && this.chapterId) {
      this.breadcrumbItems.push({
        label: 'Temas',
        routerLink: '/admin/temas',
        queryParams: { courseId: this.courseId, chapterId: this.chapterId }
      });
    }

    this.breadcrumbItems.push({ label: 'Actividades' });
  }

  createForm(): FormGroup {
    return this.fb.group({
      temaId: [this.temaId, Validators.required],
      title: ['', Validators.required]
    });
  }



  loadActivities() {
    if (!this.temaId) {
      this.activities = [];
      return;
    }

    this.loading = true;
    this.activityService.getActivitiesByTemaId(this.temaId).subscribe({
      next: (response) => {
        this.activities = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las actividades'
        });
        this.loading = false;
      }
    });
  }

  showCreateDialog() {
    this.activityForm.reset({
      temaId: this.temaId,
      title: ''
    });
    this.currentActivityId = null;
    this.displayCreateDialog = true;
  }

  showEditDialog(activity: Activity) {
    this.currentActivityId = activity.id;
    this.loading = true;
    
    this.activityService.getActivityById(activity.id).subscribe({
      next: (response) => {
        this.activityForm.patchValue({
          temaId: this.temaId,
          title: response.title
        });
        this.displayEditDialog = true;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar actividad'
        });
        console.error(err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  createActivity() {
    if (this.activityForm.valid) {
      this.loading = true;
      const data = this.activityForm.value;
      
      this.activityService.createActivity(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad creada correctamente'
          });
          this.displayCreateDialog = false;
          this.loadActivities();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear actividad'
          });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  updateActivity() {
    if (this.activityForm.valid && this.currentActivityId) {
      const data = this.activityForm.value;
      this.loading = true;
      
      this.activityService.updateActivity(this.currentActivityId, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad actualizada correctamente'
          });
          this.displayEditDialog = false;
          this.loadActivities();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar actividad'
          });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  confirmDelete(activity: Activity) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la actividad "${activity.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.deleteActivity(activity.id),
      reject: () => {}
    });
  }

  deleteActivity(activityId: number) {
    this.loading = true;
    this.activityService.deleteActivity(activityId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Actividad eliminada correctamente'
        });
        this.loadActivities();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar actividad'
        });
        console.error(err);
        this.loading = false;
      }
    });
  }

  hideDialog() {
    if (this.currentActivityId) {
      this.displayEditDialog = false;
    } else {
      this.displayCreateDialog = false;
    }
    this.currentActivityId = null;
    this.activityForm.reset();
  }

  navigateToExercises(activityId: number) {
    // Navegar a la página de ejercicios conservando el estado actual en la URL
    this.router.navigate(['/admin/exercises', activityId], {
      queryParams: {
        returnTemaId: this.temaId,
        returnChapterId: this.chapterId,
        returnCourseId: this.courseId
      }
    });
  }
  
}
