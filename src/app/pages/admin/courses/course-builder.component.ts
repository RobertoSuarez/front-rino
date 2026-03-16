import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { AiService } from '../../../core/services/ai.service';
import { CourseService } from '../../../core/services/course.service';

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
    ToggleButtonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './course-builder.component.html',
  styleUrls: ['./course-builder.component.css']
})
export class CourseBuilderComponent implements OnInit {
  courseForm: FormGroup;
  generating: boolean = false;
  saving: boolean = false;
  
  // Amauta Chatbot state
  displayChat: boolean = false;
  chatMessages: { role: 'user' | 'ai', text: string }[] = [];
  userMessage: string = '';
  aiTyping: boolean = false;
  
  // Wizard state
  wizardStep: 'topic' | 'title-suggestions' | 'chapter-suggestions' | 'supervised-curation' | 'builder' = 'topic';
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

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private courseService: CourseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      courseTitle: ['', Validators.required],
      description: ['', Validators.required],
      urlLogo: ['https://i.ibb.co/chdPzT1f/Quiero-un-logo-para-mi-aplicaci-n-web-gamificada-para-ense-ar-cyberseguridad.jpg'],
      isPublic: [false],
      isDraft: [true],
      chapters: this.fb.array([])
    });
  }

  lastSaved: Date | null = null;
  autosaving: boolean = false;

  ngOnInit(): void {
    this.loadFromLocalStorage();
    
    if (this.chapters.length === 0) {
      this.addChapter(); // Start with one chapter if empty
    }

    this.chatMessages.push({ 
      role: 'ai', 
      text: '¡Hola! Soy Amauta, tu asistente pedagógico. Tu cuaderno de trabajo está listo. ¿En qué puedo ayudarte a diseñar hoy?' 
    });

    // Autosave listener
    this.courseForm.valueChanges.subscribe(() => {
      this.saveToLocalStorage();
    });
  }

  saveToLocalStorage() {
    this.autosaving = true;
    localStorage.setItem('course_builder_draft', JSON.stringify(this.courseForm.value));
    this.lastSaved = new Date();
    setTimeout(() => this.autosaving = false, 1000);
  }

  loadFromLocalStorage() {
    const draft = localStorage.getItem('course_builder_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        this.courseForm.patchValue({
          courseTitle: data.courseTitle,
          description: data.description,
          urlLogo: data.urlLogo,
          isPublic: data.isPublic,
          isDraft: data.isDraft
        });

        // Rebuild chapters array
        if (data.chapters) {
          while (this.chapters.length) this.chapters.removeAt(0);
          data.chapters.forEach((chap: any) => this.addChapter(chap));
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
        localStorage.removeItem('course_builder_draft');
        window.location.reload();
      }
    });
  }

  get chapters() {
    return this.courseForm.get('chapters') as FormArray;
  }

  addChapter(data?: any) {
    const chapterGroup = this.fb.group({
      title: [data?.title || '', Validators.required],
      description: [data?.description || '', Validators.required],
      temas: this.fb.array([])
    });
    
    this.chapters.push(chapterGroup);
    
    if (data?.temas) {
      data.temas.forEach((t: any) => this.addTema(this.chapters.length - 1, t));
    }
    // REMOVED autonomous empty tema addition
  }

  removeChapter(index: number) {
    this.chapters.removeAt(index);
  }

  getTemas(chapterIndex: number) {
    return this.chapters.at(chapterIndex).get('temas') as FormArray;
  }

  addTema(chapterIndex: number, data?: any) {
    const temaGroup = this.fb.group({
      title: [data?.title || '', Validators.required],
      shortDescription: [data?.shortDescription || '', Validators.required],
      activities: this.fb.array([])
    });

    this.getTemas(chapterIndex).push(temaGroup);

    if (data?.activities) {
      data.activities.forEach((a: any) => this.addActivity(chapterIndex, this.getTemas(chapterIndex).length - 1, a));
    }
    // REMOVED autonomous empty activity addition
  }

  removeTema(chapterIndex: number, temaIndex: number) {
    this.getTemas(chapterIndex).removeAt(temaIndex);
  }

  getActivities(chapterIndex: number, temaIndex: number) {
    return this.getTemas(chapterIndex).at(temaIndex).get('activities') as FormArray;
  }

  addActivity(chapterIndex: number, temaIndex: number, data?: any) {
    const activityGroup = this.fb.group({
      title: [data?.title || '', Validators.required],
      exercises: this.fb.array([])
    });

    this.getActivities(chapterIndex, temaIndex).push(activityGroup);

    if (data?.exercises) {
      data.exercises.forEach((ex: any) => this.addExercise(chapterIndex, temaIndex, this.getActivities(chapterIndex, temaIndex).length - 1, ex));
    }
    // REMOVED autonomous empty exercise addition
  }

  removeActivity(chapterIndex: number, temaIndex: number, activityIndex: number) {
    this.getActivities(chapterIndex, temaIndex).removeAt(activityIndex);
  }

  getExercises(chapterIndex: number, temaIndex: number, activityIndex: number) {
    return this.getActivities(chapterIndex, temaIndex).at(activityIndex).get('exercises') as FormArray;
  }

  addExercise(chapterIndex: number, temaIndex: number, activityIndex: number, data?: any) {
    const exGroup = this.fb.group({
      statement: [data?.statement || '', Validators.required],
      typeExercise: [data?.typeExercise || 'selection_single'],
      difficulty: [data?.difficulty || 'Fácil'],
      optionSelectOptions: [data?.optionSelectOptions || []],
      answerSelectCorrect: [data?.answerSelectCorrect || '']
    });
    this.getExercises(chapterIndex, temaIndex, activityIndex).push(exGroup);
  }

  removeExercise(chapterIndex: number, temaIndex: number, activityIndex: number, exerciseIndex: number) {
    this.getExercises(chapterIndex, temaIndex, activityIndex).removeAt(exerciseIndex);
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
    this.courseForm.patchValue({ courseTitle: title });
    this.wizardStep = 'chapter-suggestions';
    this.getNewChapterSuggestions();
  }

  getNewChapterSuggestions() {
    this.loadingSuggestions = true;
    this.aiService.generateChaptersAI(this.courseForm.get('courseTitle')?.value).subscribe({
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
          description: chapter.description
        });
      } else {
        this.addChapter({
          title: chapter.title,
          description: chapter.description
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
    const courseTitle = this.courseForm.get('courseTitle')?.value;
    
    if (!chapter.value.title) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El capítulo necesita un título' });
        return;
    }

    this.loadingSuggestions = true;
    this.aiService.generateTopicsAI(courseTitle, chapter.value.title).subscribe({
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

  saveCourse() {
    if (this.courseForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Completa todos los campos requeridos' });
      return;
    }

    this.saving = true;
    this.courseService.createBulkCourse(this.courseForm.value).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Curso creado correctamente. ¡Buen trabajo en tu cuaderno!' });
        localStorage.removeItem('course_builder_draft');
        this.router.navigate(['/courses']);
        this.saving = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el curso' });
        this.saving = false;
      }
    });
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
}
