import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AiService } from '../../../core/services/ai.service';
import { CourseService } from '../../../core/services/course.service';
import { LayoutService } from '../../../layout/service/layout.service';
import { QuillModule } from 'ngx-quill';
import { ExerciseGenerationService, GeneratedExercise } from '../../../core/services/exercise-generation.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { GenerateExercisesDialogComponent } from '../../admin/exercises/components/generate-exercises-dialog.component';
import { ExerciseEditorDialogComponent } from '../../admin/exercises/components/exercise-editor-dialog/exercise-editor-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface BuilderActivity {
  title: string;
  suggestedType: string;
}

interface BuilderTema {
  title: string;
  shortDescription: string;
  activities: BuilderActivity[];
}

interface BuilderChapter {
  title: string;
  description: string;
  temas: BuilderTema[];
}

@Component({
  selector: 'app-course-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    AccordionModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressSpinnerModule,
    DialogModule,
    ChipModule,
    TextareaModule,
    ToggleButtonModule,
    SelectButtonModule,
    QuillModule,
    GenerateExercisesDialogComponent,
    ExerciseEditorDialogComponent // Added to @Component imports
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './course-builder.component.html',
  styleUrls: ['./course-builder.component.css']
})
export class CourseBuilderComponent implements OnInit, OnDestroy {
  courseForm: FormGroup;
  generating: boolean = false;
  saving: boolean = false;
  loading: boolean = false;
  courseId: number | null = null;

  // Amauta Chatbot state
  displayChat: boolean = false;
  chatMessages: { role: 'user' | 'ai', text: string }[] = [];
  userMessage: string = '';
  aiTyping: boolean = false;

  // Wizard state
  wizardStep: 'topic' | 'title-suggestions' | 'description-suggestion' | 'chapter-suggestions' | 'supervised-curation' | 'builder' = 'topic';
  wizardTopic: string = '';
  suggestedTitles: string[] = [];
  suggestedChapters: any[] = [];
  currentTitleIndex: number = 0;
  currentChapterIndex: number = 0;

  // Supervised curation state
  currentChapterSupervIndex: number = 0;
  tempTopicSuggestions: any[] = []; // Topics suggested by AI but not yet approved
  tempExerciseSuggestions: any[] = []; // Exercises suggested by AI but not yet approved
  currentTopicSuggestionIndex: number = 0;
  supervisingExercises: boolean = false;
  currentSupervisingTemaIndex: number = -1;
  loadingSuggestions: boolean = false;

  // Builder state
  sidebarVisible: boolean = true;
  autosaving: boolean = false;
  lastSaved: Date | null = null;

  // UI State: track preview mode per topic (key: "chapIndex-temaIndex")
  previewModes: { [key: string]: boolean } = {};

  // UI State: track expanded activities (key: "chapIndex-temaIndex-actIndex")
  expandedActivities: { [key: string]: boolean } = {};

  // UI State: track view mode per activity (key: "chapIndex-temaIndex-actIndex", value: 'list' | 'sandbox')
  exercisesViewMode: { [key: string]: 'list' | 'sandbox' } = {};

  defaultImages: string[] = [
    'https://i.ibb.co/chdPzT1f/Quiero-un-logo-para-mi-aplicaci-n-web-gamificada-para-ense-ar-cyberseguridad.jpg',
    'https://i.ibb.co/YBRnQLst/quiero-que-me-ayudes-creando-una-imagen-que-pueda-usar-de-portada-para-un-curso-de-varios-que-tengo.jpg',
    'https://i.ibb.co/hPLvgjc/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/mdBjLyJ/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/77tzGmy/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/932zmNVD/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/gZLQn5Jg/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg'
  ];

  uploadedImages: string[] = [];

  // Exercise Type Metadata
  exerciseTypeMap: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    'selection_single': { label: 'Selección Simple', icon: 'pi pi-check-circle', color: '#2563eb', bg: '#eff6ff' },
    'selection_multiple': { label: 'Selección Múltiple', icon: 'pi pi-check-square', color: '#7c3aed', bg: '#f5f3ff' },
    'vertical_ordering': { label: 'Orden Vertical', icon: 'pi pi-sort-amount-down', color: '#0891b2', bg: '#ecfeff' },
    'horizontal_ordering': { label: 'Orden Horizontal', icon: 'pi pi-arrows-h', color: '#0d9488', bg: '#f0fdfa' },
    'phishing_selection_multiple': { label: 'Detección Phishing', icon: 'pi pi-shield', color: '#dc2626', bg: '#fef2f2' },
    'match_pairs': { label: 'Emparejar Conceptos', icon: 'pi pi-link', color: '#ea580c', bg: '#fff7ed' },
  };

  // Preview State
  displayExercisePreview: boolean = false;
  selectedExerciseForPreview: any = null;

  // Cover Image Modal State
  displayImageModal: boolean = false;

  // AI Wizard State
  @ViewChild('genWizard') genWizard!: GenerateExercisesDialogComponent;
  @ViewChild('exerciseEditorDialog') exerciseEditorDialog!: ExerciseEditorDialogComponent; // Added ViewChild
  displayGenWizard: boolean = false;
  currentGenContext: { chapterI: number, temaJ: number, activityK?: number } | null = null;

  toggleActivityExpansion(chapI: number, temaJ: number, actK: number): void {
    const key = `${chapI}-${temaJ}-${actK}`;
    this.expandedActivities[key] = !this.expandedActivities[key];
  }

  isActivityExpanded(chapI: number, temaJ: number, actK: number): boolean {
    return !!this.expandedActivities[`${chapI}-${temaJ}-${actK}`];
  }

  toggleExercisesView(chapI: number, temaJ: number, actK: number): void {
    const key = `${chapI}-${temaJ}-${actK}`;
    const current = this.exercisesViewMode[key] || 'list';
    this.exercisesViewMode[key] = current === 'list' ? 'sandbox' : 'list';
  }

  getExercisesViewMode(chapI: number, temaJ: number, actK: number): 'list' | 'sandbox' {
    return this.exercisesViewMode[`${chapI}-${temaJ}-${actK}`] || 'list';
  }

  get isEditMode(): boolean {
    return this.courseId !== null;
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'GUARDAR CAMBIOS' : 'GUARDAR Y PUBLICAR';
  }

  get saveSuccessSummary(): string {
    return this.isEditMode ? '¡Cambios Guardados!' : '¡Curso Publicado!';
  }

  get saveSuccessDetail(): string {
    return this.isEditMode
      ? 'Los cambios del curso se sincronizaron correctamente.'
      : 'Tu obra maestra ha sido guardada con éxito.';
  }

  get storageKey(): string {
    return this.courseId ? `course_edit_draft_${this.courseId}` : 'course_builder_draft';
  }

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private courseService: CourseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    public layoutService: LayoutService,
    private exerciseGenerationService: ExerciseGenerationService,
    private exerciseService: ExerciseService,
    private http: HttpClient
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      urlLogo: ['https://i.ibb.co/chdPzT1f/Quiero-un-logo-para-mi-aplicaci-n-web-gamificada-para-ense-ar-cyberseguridad.jpg'],
      code: [this.generateTempCode()],
      index: [0],
      isPublic: [false],
      isDraft: [true],
      chapters: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // 1. Verificar si estamos editando (por URL params o query params)
    const urlId = this.route.snapshot.params['id'];
    const queryId = this.route.snapshot.queryParams['id'];
    const id = urlId || queryId;

    if (id) {
      this.courseId = +id;
      this.loadCourseForEdit(this.courseId);
      this.wizardStep = 'builder';

      // Focus mode (sidebar inactive)
      this.layoutService.layoutState.update(prev => ({
        ...prev, staticMenuDesktopInactive: true
      }));
    } else {
      // 2. Flujo de creación normal
      const draft = localStorage.getItem(this.storageKey);
      if (draft && !this.isEditMode) {
        this.confirmationService.confirm({
          message: '¡Existe un borrador de curso! ¿Deseas volver a trabajar sobre él? De lo contrario, comenzaremos uno nuevo desde cero.',
          header: 'Borrador Detectado',
          icon: 'pi pi-info-circle',
          acceptLabel: 'Continuar Borrador',
          rejectLabel: 'Comenzar Nuevo',
          accept: () => {
            this.loadFromLocalStorage();
          },
          reject: () => {
            localStorage.removeItem(this.storageKey);
            this.initNewCourseState();
          }
        });
      } else {
        this.initNewCourseState();
      }
    }

    this.chatMessages.push({
      role: 'ai',
      text: '¡Hola! Soy Amauta, tu asistente pedagógico. Tu cuaderno de trabajo está listo. ¿En qué puedo ayudarte a diseñar hoy?'
    });

    // Logo Auto-generation
    this.courseForm.get('title')?.valueChanges.subscribe((title: string) => {
      if (!this.isEditMode && title) {
        const formattedTitle = title.trim().replace(/\s+/g, '+');
        const generatedUrl = `https://ui-avatars.com/api/?name=${formattedTitle}&background=12BA82&color=fff`;
        this.courseForm.patchValue({ urlLogo: generatedUrl }, { emitEvent: false });
      }
    });

    // Autosave listener
    this.courseForm.valueChanges.subscribe(() => {
      this.saveToLocalStorage();
    });
  }

  ngOnDestroy(): void {
    // Restore platform sidebar
    this.layoutService.layoutState.update(prev => ({
      ...prev,
      staticMenuDesktopInactive: false
    }));
  }

  loadCourseForEdit(id: number) {
    this.loading = true;
    this.generating = true;
    this.loadingSuggestions = true;

    this.courseService.getCourseFullDetail(id).subscribe({
      next: (res) => {
        // El backend responde con { statusCode, message, data: { message, data: { ... } } }
        // O a veces viene ya unwrapped por un interceptor.
        const responseData = res.data || res;
        const data = responseData.data || responseData;

        console.log('Cargando curso para edición:', data);

        if (!data || !data.title) {
          console.error('Estructura de datos inválida:', res);
          return;
        }

        this.courseForm.patchValue({
          title: data.title,
          description: data.description,
          urlLogo: data.urlLogo,
          code: data.code,
          index: data.index,
          isPublic: data.isPublic,
          isDraft: data.isDraft
        });

        // Reconstruir jerarquía completa
        while (this.chapters.length) this.chapters.removeAt(0);
        if (data.chapters) {
          data.chapters.forEach((chap: any) => {
            // Mapeamos shortDescription a description si es necesario
            const formattedChap = {
              ...chap,
              description: chap.description || chap.shortDescription
            };
            this.addChapter(formattedChap);
          });
          this.sortCourseHierarchy();
        }

        this.loading = false;
        this.wizardStep = 'builder'; // Ir directo al constructor
        this.messageService.add({ severity: 'success', summary: 'Cargado', detail: 'Curso cargado para edición' });
        this.generating = false;
        this.loadingSuggestions = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle del curso:', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el curso' });
        this.generating = false;
        this.loadingSuggestions = false;
      }
    });
  }

  saveToLocalStorage() {
    this.autosaving = true;
    localStorage.setItem(this.storageKey, JSON.stringify(this.courseForm.value));
    this.lastSaved = new Date();
    setTimeout(() => this.autosaving = false, 1000);
  }

  loadFromLocalStorage() {
    const draft = localStorage.getItem(this.storageKey);
    if (draft) {
      try {
        const data = JSON.parse(draft);

        // --- FIX: Polluted Draft Cleanup ---
        if (!this.isEditMode) {
          const hasStaleIds = (data.chapters || []).some((c: any) => c.id != null) || data.id != null;
          if (hasStaleIds) {
            console.warn('Polluted draft detected for a new course. Clearing to prevent data leakage.');
            this.clearDraft();
            return; // Skip loading
          }
        }
        // -----------------------------------

        this.courseForm.patchValue({
          title: data.title,
          description: data.description,
          urlLogo: data.urlLogo,
          code: data.code,
          index: data.index,
          isPublic: data.isPublic,
          isDraft: data.isDraft
        });

        // Rebuild chapters array
        if (data.chapters) {
          while (this.chapters.length) this.chapters.removeAt(0);
          data.chapters.forEach((chap: any) => this.addChapter(chap));
          this.sortCourseHierarchy();
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }

  clearDraft() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres limpiar este cuaderno de trabajo?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        localStorage.removeItem(this.storageKey);
        window.location.reload();
      }
    });
  }

  get chapters() {
    return this.courseForm.get('chapters') as FormArray;
  }

  private initNewCourseState() {
    if (this.chapters.length === 0) {
      this.addChapter();
      this.sortCourseHierarchy();
    }
  }

  addChapter(data?: any) {
    const chapterGroup = this.fb.group({
      id: [data?.id || null],
      title: [data?.title || '', Validators.required],
      shortDescription: [data?.shortDescription || data?.description || '', Validators.required],
      index: [data?.index ?? this.chapters.length],
      difficulty: [data?.difficulty || 'Fácil'],
      temas: this.fb.array([])
    });

    this.chapters.push(chapterGroup);

    if (data?.temas) {
      data.temas.forEach((t: any) => this.addTema(this.chapters.length - 1, t));
    }
    this.sortFormArrayByIndex(this.chapters);
  }

  removeChapter(index: number) {
    this.chapters.removeAt(index);
  }

  getTemas(chapterIndex: number) {
    return this.chapters.at(chapterIndex).get('temas') as FormArray;
  }

  addTema(chapterIndex: number, data?: any) {
    const temaGroup = this.fb.group({
      id: [data?.id || null],
      title: [data?.title || '', Validators.required],
      shortDescription: [data?.shortDescription || '', Validators.required],
      theory: [data?.theory || ''],
      urlBackground: [data?.urlBackground || null],
      index: [data?.index ?? this.getTemas(chapterIndex).length],
      difficulty: [data?.difficulty || 'Fácil'],
      activities: this.fb.array([])
    });

    this.getTemas(chapterIndex).push(temaGroup);

    if (data?.activities) {
      data.activities.forEach((a: any) => this.addActivity(chapterIndex, this.getTemas(chapterIndex).length - 1, a));
    }
    this.sortFormArrayByIndex(this.getTemas(chapterIndex));
  }

  removeTema(chapterIndex: number, temaIndex: number) {
    this.getTemas(chapterIndex).removeAt(temaIndex);
  }

  getActivities(chapterIndex: number, temaIndex: number) {
    return this.getTemas(chapterIndex).at(temaIndex).get('activities') as FormArray;
  }

  addActivity(chapterIndex: number, temaIndex: number, data?: any) {
    const activityGroup = this.fb.group({
      id: [data?.id || null],
      title: [data?.title || '', Validators.required],
      index: [data?.index ?? this.getActivities(chapterIndex, temaIndex).length],
      exercises: this.fb.array([])
    });

    this.getActivities(chapterIndex, temaIndex).push(activityGroup);

    if (data?.exercises) {
      data.exercises.forEach((ex: any) => this.addExercise(chapterIndex, temaIndex, this.getActivities(chapterIndex, temaIndex).length - 1, ex));
    }
    this.sortFormArrayByIndex(this.getActivities(chapterIndex, temaIndex));
  }

  removeActivity(chapterIndex: number, temaIndex: number, activityIndex: number) {
    this.getActivities(chapterIndex, temaIndex).removeAt(activityIndex);
  }

  getActivity(chapterIndex: number, temaIndex: number, activityIndex: number) {
    return this.getActivities(chapterIndex, temaIndex).at(activityIndex) as FormGroup;
  }

  getExercises(chapterIndex: number, temaIndex: number, activityIndex: number) {
    return this.getActivity(chapterIndex, temaIndex, activityIndex).get('exercises') as FormArray;
  }

  addExercise(chapterIndex: number, temaIndex: number, activityIndex: number, data?: any) {
    const exGroup = this.fb.group({
      id: [data?.id || null],
      index: [data?.index ?? this.getExercises(chapterIndex, temaIndex, activityIndex).length],
      createdAt: [data?.createdAt || new Date().toISOString()],
      updatedAt: [data?.updatedAt || null],
      difficulty: [data?.difficulty || 'Fácil'],
      statement: [data?.statement || '', Validators.required],
      hind: [data?.hind || ''],
      typeExercise: [data?.typeExercise || 'selection_single'],
      // Options
      optionSelectOptions: [data?.optionSelectOptions || []],
      optionOrderFragmentCode: [data?.optionOrderFragmentCode || []],
      optionOrderLineCode: [data?.optionOrderLineCode || []],
      optionsFindErrorCode: [data?.optionsFindErrorCode || []],
      // Answers
      answerSelectCorrect: [data?.answerSelectCorrect || ''],
      answerSelectsCorrect: [data?.answerSelectsCorrect || []],
      answerOrderFragmentCode: [data?.answerOrderFragmentCode || []],
      answerOrderLineCode: [data?.answerOrderLineCode || []],
      answerFindError: [data?.answerFindError || ''],
      answerWriteCode: [data?.answerWriteCode || ''],
      // Extra types
      optionsVerticalOrdering: [data?.optionsVerticalOrdering || []],
      answerVerticalOrdering: [data?.answerVerticalOrdering || []],
      optionsHorizontalOrdering: [data?.optionsHorizontalOrdering || []],
      answerHorizontalOrdering: [data?.answerHorizontalOrdering || []],
      optionsPhishingSelection: [data?.optionsPhishingSelection || []],
      answerPhishingSelection: [data?.answerPhishingSelection || []],
      phishingContext: [data?.phishingContext || ''],
      phishingImageUrl: [data?.phishingImageUrl || ''],
      optionsMatchPairsLeft: [data?.optionsMatchPairsLeft || []],
      optionsMatchPairsRight: [data?.optionsMatchPairsRight || []],
      answerMatchPairs: [data?.answerMatchPairs || []]
    });
    this.getExercises(chapterIndex, temaIndex, activityIndex).push(exGroup);
    this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
  }

  addAndEditExercise(chapterIndex: number, temaIndex: number, activityIndex: number) {
    this.addExercise(chapterIndex, temaIndex, activityIndex);
    const newIndex = this.getExercises(chapterIndex, temaIndex, activityIndex).length - 1;
    this.openEditExerciseDialog(chapterIndex, temaIndex, activityIndex, newIndex);
  }

  removeExercise(chapterIndex: number, temaIndex: number, activityIndex: number, exerciseIndex: number) {
    const exerciseGroup = this.getExercises(chapterIndex, temaIndex, activityIndex).at(exerciseIndex);
    const exerciseId = exerciseGroup.value.id;

    const removeLocal = () => {
      this.getExercises(chapterIndex, temaIndex, activityIndex).removeAt(exerciseIndex);
      this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
      this.messageService.add({ severity: 'info', summary: 'Removido', detail: 'Ejercicio quitado localmente' });
    };

    if (exerciseId) {
      this.confirmationService.confirm({
        message: '¿Estás seguro de que quieres eliminar completamente este ejercicio de la base de datos?',
        header: 'Confirmación de Eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.exerciseService.deleteExercise(exerciseId).subscribe({
            next: () => {
              this.getExercises(chapterIndex, temaIndex, activityIndex).removeAt(exerciseIndex);
              this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ejercicio eliminado de la base de datos' });
            },
            error: (err) => {
              console.error('Error deleting exercise:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el ejercicio' });
            }
          });
        }
      });
    } else {
      removeLocal();
    }
  }

  // --- EXERCISE EDITING METHODS ---

  openEditExerciseDialog(chapterIndex: number, temaIndex: number, activityIndex: number, exerciseIndex: number) {
    const exerciseGroup = this.getExercises(chapterIndex, temaIndex, activityIndex).at(exerciseIndex);
    const exerciseData = exerciseGroup.value;
    const metaData = { chapterIndex, temaIndex, activityIndex, exerciseIndex };

    if (this.exerciseEditorDialog) {
      this.exerciseEditorDialog.openEdit(exerciseData, metaData);
    }
  }

  onExerciseSave(event: any) {
    const { data, meta } = event;
    if (meta) {
      const { chapterIndex, temaIndex, activityIndex, exerciseIndex } = meta;
      const exerciseGroup = this.getExercises(chapterIndex, temaIndex, activityIndex).at(exerciseIndex);
      const activityId = this.getActivity(chapterIndex, temaIndex, activityIndex).value.id;
      const payload = this.buildExercisePayload(data, exerciseGroup.value, activityId);

      if (activityId) {
        if (data.id) {
          this.exerciseService.updateExercise(data.id, payload).subscribe({
            next: (res: any) => {
              exerciseGroup.patchValue({ ...exerciseGroup.value, ...data, ...res, index: payload.index });
              this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
              this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'El ejercicio ha sido sincronizado con la BD' });
            },
            error: (err) => {
              console.error('Error updating exercise:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el ejercicio en la BD' });
            }
          });
        } else {
          this.exerciseService.createExercise(payload).subscribe({
            next: (res: any) => {
              exerciseGroup.patchValue({ ...exerciseGroup.value, ...data, id: res.id, index: payload.index });
              this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
              this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'El nuevo ejercicio se ha guardado en la BD' });
            },
            error: (err) => {
              console.error('Error creating exercise:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ejercicio en la BD' });
            }
          });
        }
      } else {
        exerciseGroup.patchValue({ ...exerciseGroup.value, ...data, index: payload.index });
        this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
        this.messageService.add({ severity: 'success', summary: 'Guardado Local', detail: 'Se sincronizará cuando guardes el curso completo' });
      }
    }
  }

  private buildExercisePayload(formData: any, currentExercise: any, activityId?: number | null) {
    const payload: any = {
      ...currentExercise,
      ...formData,
      index: formData.index ?? currentExercise?.index ?? 0,
    };

    if (activityId) {
      payload.activityId = activityId;
    }

    return payload;
  }

  private sortCourseHierarchy(): void {
    this.sortFormArrayByIndex(this.chapters);

    this.chapters.controls.forEach((chapterControl, chapterIndex) => {
      const temas = this.getTemas(chapterIndex);
      this.sortFormArrayByIndex(temas);

      temas.controls.forEach((_, temaIndex) => {
        const activities = this.getActivities(chapterIndex, temaIndex);
        this.sortFormArrayByIndex(activities);

        activities.controls.forEach((__, activityIndex) => {
          this.sortExercisesByCreationDate(this.getExercises(chapterIndex, temaIndex, activityIndex));
        });
      });
    });
  }

  private sortExercisesByCreationDate(formArray: FormArray): void {
    const sortedControls = [...formArray.controls].sort((a, b) => {
      const leftCreatedAt = a.get('createdAt')?.value;
      const rightCreatedAt = b.get('createdAt')?.value;

      const leftTime = leftCreatedAt ? new Date(leftCreatedAt).getTime() : 0;
      const rightTime = rightCreatedAt ? new Date(rightCreatedAt).getTime() : 0;

      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }

      const leftId = Number(a.get('id')?.value ?? 0);
      const rightId = Number(b.get('id')?.value ?? 0);
      return leftId - rightId;
    });

    formArray.clear({ emitEvent: false });
    sortedControls.forEach((control) => formArray.push(control, { emitEvent: false }));
  }

  private sortFormArrayByIndex(formArray: FormArray): void {
    const sortedControls = [...formArray.controls].sort((a, b) => {
      const left = Number(a.get('index')?.value ?? 0);
      const right = Number(b.get('index')?.value ?? 0);
      return left - right;
    });

    formArray.clear({ emitEvent: false });
    sortedControls.forEach((control) => formArray.push(control, { emitEvent: false }));
  }

  // ENHANCEMENT METHODS

  getExerciseIcon(type: string): string {
    return this.exerciseTypeMap[type]?.icon || 'pi pi-question-circle';
  }

  getExerciseColor(type: string): string {
    return this.exerciseTypeMap[type]?.color || '#94a3b8';
  }

  openExercisePreview(exercise: any) {
    this.selectedExerciseForPreview = exercise;
    this.displayExercisePreview = true;
  }

  openActivitySandbox(activity: any) {
    if (!activity.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Guarda el curso primero para probar esta actividad en el Sandbox'
      });
      return;
    }
    this.router.navigate(['/admin/exercises', activity.id, 'sandbox'], {
      queryParams: {
        returnCourseId: this.courseId
      }
    });
  }

  openGenWizard(chapterI: number, temaJ: number, activityK: number) {
    this.currentGenContext = { chapterI, temaJ, activityK };
    this.genWizard.open();
  }

  onExercisesGenerated(exercises: GeneratedExercise[]) {
    if (!this.currentGenContext || exercises.length === 0) return;

    const { chapterI, temaJ, activityK } = this.currentGenContext;

    if (activityK === undefined) return;

    exercises.forEach(ex => {
      this.addExercise(chapterI, temaJ, activityK, {
        statement: ex.statement,
        typeExercise: ex.typeExercise,
        difficulty: ex.difficulty,
        optionSelectOptions: ex.optionSelectOptions || [],
        optionOrderFragmentCode: ex.optionOrderFragmentCode || [],
        optionOrderLineCode: ex.optionOrderLineCode || [],
        optionsFindErrorCode: ex.optionsFindErrorCode || [],
        answerSelectCorrect: ex.answerSelectCorrect || '',
        answerSelectsCorrect: ex.answerSelectsCorrect || [],
        answerOrderFragmentCode: ex.answerOrderFragmentCode || [],
        answerOrderLineCode: ex.answerOrderLineCode || [],
        answerFindError: ex.answerFindError || '',
        optionsVerticalOrdering: ex.optionsVerticalOrdering || [],
        answerVerticalOrdering: ex.answerVerticalOrdering || [],
        optionsHorizontalOrdering: ex.optionsHorizontalOrdering || [],
        answerHorizontalOrdering: ex.answerHorizontalOrdering || [],
        optionsPhishingSelection: ex.optionsPhishingSelection || [],
        answerPhishingSelection: ex.answerPhishingSelection || [],
        phishingContext: ex.phishingContext || '',
        phishingImageUrl: ex.phishingImageUrl || '',
        optionsMatchPairsLeft: ex.leftItems || [],
        optionsMatchPairsRight: ex.rightItems || [],
        answerMatchPairs: ex.pairs || [],
        hind: ex.hint || ''
      });
    });

    this.messageService.add({
      severity: 'success',
      summary: '¡Bingo!',
      detail: `Se han añadido ${exercises.length} ejercicios a la actividad.`
    });

    this.displayGenWizard = false;
  }

  // WIZARD METHODS

  startWizard() {
    if (!this.wizardTopic.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingresa un tema para comenzar' });
      return;
    }
    this.loadingSuggestions = true;
    this.aiService.suggestTitlesAI(this.wizardTopic).subscribe({
      next: (res) => {
        this.suggestedTitles = res.data || [];
        if (this.suggestedTitles.length === 0) {
          this.messageService.add({ severity: 'warn', summary: 'Sin resultados', detail: 'La IA no pudo generar títulos. Intenta con otro tema.' });
          this.loadingSuggestions = false;
          return;
        }
        this.wizardStep = 'title-suggestions';
        this.currentTitleIndex = 0;
        this.loadingSuggestions = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener sugerencias' });
        this.loadingSuggestions = false;
      }
    });
  }

  selectTitle(title: string) {
    this.courseForm.patchValue({ title: title });
  }

  getMoreTitles() {
    this.startWizard();
  }

  confirmTitle() {
    const title = this.courseForm.get('title')?.value;
    if (!title) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El curso debe tener un título' });
      return;
    }
    this.generateDescriptionAI();
  }

  async generateDescriptionAI() {
    this.loadingSuggestions = true;
    this.wizardStep = 'description-suggestion';
    const title = this.courseForm.get('title')?.value;

    this.aiService.generateCourseDescription(title).subscribe({
      next: (res: any) => {
        if (res.data && res.data.description) {
          this.courseForm.patchValue({ description: res.data.description });
        }
        this.loadingSuggestions = false;
      },
      error: () => {
        this.loadingSuggestions = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar la descripción' });
      }
    });
  }

  getMoreDescription() {
    this.generateDescriptionAI();
  }

  confirmDescription() {
    this.getNewChapterSuggestions(); // Move to chapters
  }

  getNewChapterSuggestions() {
    this.wizardStep = 'chapter-suggestions';
    this.loadingSuggestions = true;
    this.aiService.generateChaptersAI(this.courseForm.get('title')?.value).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.suggestedChapters = data.chapters || data; // El back devuelve { chapters: [...] } o el array directo
        this.currentChapterIndex = 0;
        this.loadingSuggestions = false;
      },
      error: () => {
        this.loadingSuggestions = false;
      }
    });
  }

  likeChapter() {
    const chapter = this.suggestedChapters[this.currentChapterIndex];
    if (chapter) {
      // Si el primer capítulo es el default vacío, lo reemplazamos
      if (this.chapters.length === 1 && !this.chapters.at(0).value.title) {
        this.chapters.at(0).patchValue({
          title: chapter.title,
          shortDescription: chapter.description
        });
      } else {
        this.addChapter({
          title: chapter.title,
          shortDescription: chapter.description
        });
      }
      this.messageService.add({ severity: 'success', summary: 'Añadido', detail: `"${chapter.title}" al cuaderno` });
    }
    this.nextChapter();
  }

  dislikeChapter() {
    this.nextChapter();
  }

  nextChapter() {
    this.currentChapterIndex++;
    if (this.currentChapterIndex >= this.suggestedChapters.length) {
      this.getNewChapterSuggestions();
    }
  }

  finishWizard() {
    this.wizardStep = 'supervised-curation';
    this.currentChapterSupervIndex = 0;
  }

  goToBuilder() {
    this.wizardStep = 'builder';
  }

  prevSupervStep() {
    if (this.currentChapterSupervIndex > 0) {
      this.currentChapterSupervIndex--;
      this.tempTopicSuggestions = [];
    }
  }

  nextSupervStep() {
    if (this.currentChapterSupervIndex < this.chapters.length - 1) {
      this.currentChapterSupervIndex++;
      this.tempTopicSuggestions = [];
    }
  }

  generateTopicsAI(chapterIndex: number) {
    const chapter = this.chapters.at(chapterIndex);
    const courseTitle = this.courseForm.get('title')?.value;

    if (!chapter.value.title) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El capítulo necesita un título' });
      return;
    }

    const safeTitle = chapter.value.title || 'Capítulo Inicial';
    const safeCourseTitle = courseTitle || 'Nuevo Curso';

    this.loadingSuggestions = true;
    this.aiService.generateTopicsAI(safeCourseTitle, safeTitle).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        const suggestedTopics = data.temas || data;

        if (this.wizardStep === 'supervised-curation') {
          this.tempTopicSuggestions = suggestedTopics;
          this.currentTopicSuggestionIndex = 0;
        } else {
          // Background flow (legacy/manual)
          suggestedTopics.forEach((t: any) => this.addTema(chapterIndex, t));
        }

        this.messageService.add({ severity: 'success', summary: 'Amauta AI', detail: 'Sugerencias de temas recibidas' });
        this.loadingSuggestions = false;
      },
      error: () => {
        this.loadingSuggestions = false;
      }
    });
  }

  approveTopic(chapterIndex: number, topic: any) {
    this.addTema(chapterIndex, topic);
    this.tempTopicSuggestions.splice(this.currentTopicSuggestionIndex, 1);
    this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: `Tema "${topic.title}" añadido.` });

    // Si llegamos al final, reset o cargar más si el usuario quiere
    if (this.currentTopicSuggestionIndex >= this.tempTopicSuggestions.length && this.tempTopicSuggestions.length > 0) {
      this.currentTopicSuggestionIndex = 0;
    }
  }

  rejectTopic() {
    this.tempTopicSuggestions.splice(this.currentTopicSuggestionIndex, 1);
    if (this.currentTopicSuggestionIndex >= this.tempTopicSuggestions.length && this.tempTopicSuggestions.length > 0) {
      this.currentTopicSuggestionIndex = 0;
    }
  }

  generateExerciseSetAI(chapterIndex: number, temaIndex: number) {
    const tema = this.getTemas(chapterIndex).at(temaIndex);
    if (!tema.value.title) return;

    this.loadingSuggestions = true;
    this.currentSupervisingTemaIndex = temaIndex;

    this.aiService.generateExerciseSetAI(tema.value.title).subscribe({
      next: (res: any) => {
        this.tempExerciseSuggestions = res.data || res;
        this.supervisingExercises = true;
        this.messageService.add({ severity: 'success', summary: 'Amauta AI', detail: `Se han sugerido ${this.tempExerciseSuggestions.length} ejercicios` });
        this.loadingSuggestions = false;
      },
      error: () => {
        this.loadingSuggestions = false;
      }
    });
  }

  confirmExercises() {
    if (this.currentSupervisingTemaIndex === -1) return;

    const activities = this.getActivities(this.currentChapterSupervIndex, this.currentSupervisingTemaIndex);
    if (activities.length === 0) {
      this.addActivity(this.currentChapterSupervIndex, this.currentSupervisingTemaIndex, { title: 'Práctica con Amauta', exercises: [] });
    }

    const activityIndex = 0;
    this.tempExerciseSuggestions.forEach((ex: any) => {
      this.addExercise(this.currentChapterSupervIndex, this.currentSupervisingTemaIndex, activityIndex, ex);
    });

    this.supervisingExercises = false;
    this.tempExerciseSuggestions = [];
    this.currentSupervisingTemaIndex = -1;
    this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Ejercicios añadidos al tema' });
  }

  cancelExerciseSupervision() {
    this.supervisingExercises = false;
    this.tempExerciseSuggestions = [];
    this.currentSupervisingTemaIndex = -1;
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  scrollToChapter(index: number) {
    const element = document.getElementById(`chapter-card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }

  logInvalidControls(form: FormGroup | FormArray, path: string = '') {
    Object.keys(form.controls).forEach(key => {
      const control = (form.controls as any)[key];
      const currentPath = path ? `${path} -> ${key}` : key;
      if (control.invalid) {
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.logInvalidControls(control, currentPath);
        } else {
          console.log(`Control inválido: ${currentPath}`, control.errors);
        }
      }
    });
  }

  saveCourse() {
    // Limpiar capítulos vacíos si hay más de uno
    if (this.chapters.length > 1) {
      for (let i = this.chapters.length - 1; i >= 0; i--) {
        const chap = this.chapters.at(i);
        if (!chap.value.title && !chap.value.description && this.getTemas(i).length === 0) {
          this.chapters.removeAt(i);
        }
      }
    }

    if (this.courseForm.invalid) {
      console.log('--- Resumen de Errores de Formulario ---');
      this.logInvalidControls(this.courseForm);

      const missingFields: string[] = [];
      if (this.courseForm.get('title')?.invalid) missingFields.push('Título del Curso');
      if (this.courseForm.get('description')?.invalid) missingFields.push('Descripción del Curso');

      // Check for errors in chapters
      this.chapters.controls.forEach((chap, i) => {
        if (chap.invalid) {
          if (chap.get('title')?.invalid) missingFields.push(`Título del Capítulo ${i + 1}`);
          if (chap.get('shortDescription')?.invalid) missingFields.push(`Descripción del Capítulo ${i + 1}`);

          const temas = this.getTemas(i);
          temas.controls.forEach((tema, j) => {
            if (tema.invalid) {
              if (tema.get('title')?.invalid) missingFields.push(`Título del Tema ${j + 1} (Cap. ${i + 1})`);
              if (tema.get('shortDescription')?.invalid) missingFields.push(`Descripción del Tema ${j + 1} (Cap. ${i + 1})`);
            }
          });
        }
      });

      this.messageService.add({
        severity: 'error',
        summary: 'Faltan datos obligatorios',
        detail: `Por favor completa: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`
      });
      return;
    }

    this.saving = true;
    const payload = this.buildBulkCoursePayload();

    this.courseService.createBulkCourse(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: this.saveSuccessSummary,
          detail: this.saveSuccessDetail
        });

        localStorage.removeItem(this.storageKey);
        this.saving = false;

        const responseData = res.data || res;
        const data = responseData.data || responseData;
        const savedCourseId = data?.id || this.courseId;

        if (!this.isEditMode && savedCourseId) {
          this.courseId = savedCourseId;
          this.router.navigate(['/admin/courses/builder', savedCourseId], {
            replaceUrl: true
          });
        } else if (this.isEditMode && savedCourseId) {
          this.courseId = savedCourseId;
        }

        // --- FIX: Force reload component state with DB IDs after save to prevent duplicates ---
        if (this.courseId) {
          this.loadCourseForEdit(this.courseId);
        }
        // -----------------------------------------------------------------------------------
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Guardado',
          detail: 'No pudimos conectar con Amauta para guardar el curso. Inténtalo de nuevo.'
        });
        this.saving = false;
      }
    });
  }

  private buildBulkCoursePayload() {
    const raw = this.courseForm.getRawValue();
    const isEdit = this.isEditMode;

    return {
      id: this.courseId,
      courseTitle: raw.title,
      description: raw.description,
      urlLogo: raw.urlLogo,
      code: raw.code,
      index: raw.index,
      isPublic: raw.isPublic,
      isDraft: false,
      chapters: (raw.chapters || []).map((chapter: any, chapterIndex: number) => ({
        id: isEdit ? (chapter.id || null) : null,
        title: chapter.title,
        description: chapter.shortDescription,
        shortDescription: chapter.shortDescription,
        index: chapter.index ?? chapterIndex,
        temas: (chapter.temas || []).map((tema: any, temaIndex: number) => ({
          id: isEdit ? (tema.id || null) : null,
          title: tema.title,
          shortDescription: tema.shortDescription,
          theory: tema.theory,
          urlBackground: tema.urlBackground,
          index: tema.index ?? temaIndex,
          activities: (tema.activities || []).map((activity: any, activityIndex: number) => ({
            id: isEdit ? (activity.id || null) : null,
            title: activity.title,
            index: activity.index ?? activityIndex,
            exercises: (activity.exercises || []).map((exercise: any, exerciseIndex: number) => ({
              ...exercise,
              id: isEdit ? (exercise.id || null) : null,
              index: exercise.index ?? exerciseIndex,
            })),
          })),
        })),
      })),
    };
  }

  // Amauta Agent logic
  toggleChat() {
    this.displayChat = !this.displayChat;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    const query = this.userMessage;
    this.chatMessages.push({ role: 'user', text: query });
    this.userMessage = '';
    this.aiTyping = true;

    // Here we could call a specific "AMAUTA" agent endpoint 
    // For now, let's use a generic prompt to simulate the agent
    const context = JSON.stringify(this.courseForm.value);

    // Simulating AI response for now to keep it responsive, 
    // or we can use AiService.generateContent with custom prompt
    this.aiService.generateTheoryWithPrompt(
      `Eres Amauta, el guía de Cyber Imperium. Ayuda al profesor con esta duda: "${query}". 
      Contexto del curso actual: ${context}. 
      Responde de forma breve, motivadora y profesional en español.`,
      "Consulta Amauta", "Asistente", "Global"
    ).subscribe({
      next: (res) => {
        this.chatMessages.push({ role: 'ai', text: res.data.theory });
        this.aiTyping = false;
      },
      error: () => {
        this.chatMessages.push({ role: 'ai', text: 'Perdona, he tenido un pequeño lapsus. ¿Puedes repetir la pregunta?' });
        this.aiTyping = false;
      }
    });
  }

  getExerciseCount(chapterIndex: number, temaIndex: number): number {
    const activities = this.getActivities(chapterIndex, temaIndex);
    if (!activities || activities.length === 0) return 0;
    const exercises = activities.at(0).get('exercises') as FormArray;
    return exercises ? exercises.length : 0;
  }

  togglePreview(chapterIndex: number, temaIndex: number) {
    const key = `${chapterIndex}-${temaIndex}`;
    this.previewModes[key] = !this.previewModes[key];
  }

  isPreviewMode(chapterIndex: number, temaIndex: number): boolean {
    const key = `${chapterIndex}-${temaIndex}`;
    // Por defecto es true (Vista Previa)
    return this.previewModes[key] !== false;
  }

  private generateTempCode(): string {
    return 'CRSE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  selectImage(imageUrl: string) {
    if (this.isEditMode) {
      this.courseForm.patchValue({ urlLogo: imageUrl });
      this.displayImageModal = false;
      this.messageService.add({ severity: 'success', summary: 'Cambio de Póster', detail: 'La imagen ha sido asignada. Recuerda guardar el curso.' });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;

      const formData = new FormData();
      formData.append('file', file);

      this.http.post(`${environment.apiUrl}/courses/upload-image`, formData)
        .subscribe({
          next: (response: any) => {
            // Manejo robusto de la respuesta (puede venir envuelta en 'data' por el interceptor o el back)
            const responseData = response.data || response;
            const imageUrl = responseData.url || (response.data && response.data.url);

            if (imageUrl) {
              // Actualizar estados locales
              this.uploadedImages.push(imageUrl);
              this.defaultImages = [...this.defaultImages, imageUrl];
              
              // Asignar al formulario
              this.courseForm.patchValue({ urlLogo: imageUrl });
              
              this.displayImageModal = false;
              this.messageService.add({ 
                severity: 'success', 
                summary: '¡Éxito!', 
                detail: 'Imagen subida y asignada correctamente a la portada.' 
              });
            } else {
              console.error('No se encontró URL en la respuesta:', response);
              this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La imagen se subió pero no pudimos obtener su ubicación.' });
            }
          },
          error: (err) => {
            console.error('Error al subir imagen', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la subida de la imagen. Intenta con otro formato.' });
          },
          complete: () => this.loading = false
        });
    }
  }
}
