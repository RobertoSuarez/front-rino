import { CursosService } from '@/core/services';
import { ChapterService } from '@/core/services/chapter.service';
import { TemaService } from '@/core/services/tema.service';
import { StudentChatService } from '@/core/services/student-chat.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
  ElementRef,
  AfterViewChecked,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TextareaModule } from 'primeng/textarea';
import { TemaConProgreso, ActividadConProgreso } from '@/core/models/tema.interface';
import { MarkdownToHtmlPipe } from '@/shared/pipes/markdown-to-html.pipe';

export type WizardPhase = 'theory' | 'amauta' | 'activities';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: number;
}

@Component({
  selector: 'app-temas-actividad-progreso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressBarModule,
    ToastModule,
    TextareaModule,
    BreadcrumbModule,
    MarkdownToHtmlPipe,
  ],
  providers: [MessageService],
  templateUrl: './temas-actividad-progreso.component.html',
  styleUrl: './temas-actividad-progreso.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemasActividadProgresoComponent implements OnInit, AfterViewChecked {

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private temaService = inject(TemaService);
  private courseService = inject(CursosService);
  private chapterService = inject(ChapterService);
  private chatService = inject(StudentChatService);
  cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private el = inject(ElementRef);

  @ViewChild('chatInput') chatInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('chatMsgsContainer') chatMessagesRef?: ElementRef<HTMLDivElement>;

  // ── Signals ─────────────────────────────────────────────────────────────────
  loading = signal(true);
  temas = signal<TemaConProgreso[]>([]);
  cursoTitulo = signal<string>('');
  capituloTitulo = signal<string>('');
  cursoId = signal<string>('');
  capituloId = signal<string>('');

  // Wizard state
  activeTemaId = signal<number | null>(null);
  activePhase = signal<WizardPhase>('theory');
  theoryScrolledToEnd = signal(false);
  markingTheory = signal(false);

  // Inline Amauta chat state
  chatMessages = signal<ChatMessage[]>([]);
  chatInputText = signal('');
  chatLoading = signal(false);
  activeChatId: number | null = null;
  chatInitialized = false;

  // Breadcrumbs
  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem | undefined;

  private theoryScrollChecked = false;

  ngOnInit(): void {
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.breadcrumbItems = [{ label: 'Mis cursos', routerLink: '/estudiante/cursos' }];

    const capituloId = this.activatedRoute.snapshot.paramMap.get('capituloId');
    const cursoId = this.activatedRoute.snapshot.paramMap.get('cursoId');

    if (capituloId && cursoId) {
      this.capituloId.set(capituloId);
      this.cursoId.set(cursoId);
      this.cargarDatosIniciales(cursoId, capituloId);
    }
  }

  ngAfterViewChecked(): void {
    if (this.activeTemaId() && this.activePhase() === 'theory' && !this.theoryScrollChecked) {
      const panel = this.el.nativeElement.querySelector('.theory-scroll-panel');
      if (panel) {
        this.theoryScrollChecked = true;
        panel.addEventListener('scroll', () => this.onTheoryScroll(panel));
        this.checkIfScrollNeeded(panel);
      }
    }
  }

  private onTheoryScroll(panel: HTMLElement): void {
    const atBottom = panel.scrollHeight - panel.scrollTop <= panel.clientHeight + 50;
    if (atBottom && !this.theoryScrolledToEnd()) {
      this.theoryScrolledToEnd.set(true);
      this.cdr.detectChanges();
    }
  }

  private checkIfScrollNeeded(panel: HTMLElement): void {
    if (panel.scrollHeight <= panel.clientHeight + 10) {
      this.theoryScrolledToEnd.set(true);
      this.cdr.detectChanges();
    }
  }

  // ── Data loading ─────────────────────────────────────────────────────────────

  private cargarDatosIniciales(cursoId: string, capituloId: string): void {
    this.loading.set(true);
    this.courseService.getCourseById(+cursoId).subscribe({
      next: (r) => { if (r?.data) { this.cursoTitulo.set(r.data.title); this.actualizarBreadcrumbs(); } }
    });
    this.chapterService.getChapterById(+capituloId).subscribe({
      next: (r) => { if (r?.data) { this.capituloTitulo.set(r.data.title); this.actualizarBreadcrumbs(); } }
    });
    this.cargarTemaConProgreso(capituloId);
  }

  private actualizarBreadcrumbs(): void {
    const items: MenuItem[] = [{ label: 'Mis cursos', routerLink: '/estudiante/cursos' }];
    if (this.cursoTitulo()) items.push({ label: this.cursoTitulo(), routerLink: `/estudiante/cursos/${this.cursoId()}/capitulos` });
    if (this.capituloTitulo()) items.push({ label: this.capituloTitulo() });
    this.breadcrumbItems = items;
  }

  cargarTemaConProgreso(capituloId: string): void {
    this.temaService.getTemaConProgreso(capituloId).subscribe({
      next: (response) => {
        if (response?.data) {
          const temasValidos = response.data.filter(t => t.activitiesToComplete > 0);
          this.temas.set(temasValidos);
        }
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  // ── Wizard navigation ─────────────────────────────────────────────────────────

  abrirTema(tema: TemaConProgreso): void {
    if (this.obtenerEstadoTema(tema) === 'locked') return;

    this.activeTemaId.set(tema.id);
    this.theoryScrollChecked = false;
    this.theoryScrolledToEnd.set(false);
    this.chatMessages.set([]);
    this.chatInputText.set('');
    this.activeChatId = null;
    this.chatInitialized = false;

    if (tema.theoryRead) {
      this.activePhase.set('activities');
    } else {
      this.activePhase.set('theory');
    }
    this.cdr.detectChanges();

    setTimeout(() => {
      const el = this.el.nativeElement.querySelector('#wizard-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cerrarTema(): void {
    this.activeTemaId.set(null);
    this.activePhase.set('theory');
    this.theoryScrolledToEnd.set(false);
    this.cdr.detectChanges();
  }

  getTemaActivo(): TemaConProgreso | null {
    const id = this.activeTemaId();
    return id ? this.temas().find(t => t.id === id) ?? null : null;
  }

  onConfirmarTeoria(): void {
    const tema = this.getTemaActivo();
    if (!tema) return;
    this.markingTheory.set(true);
    this.temaService.markTheoryRead(tema.id).subscribe({
      next: () => {
        this.temas.update(list => list.map(t => t.id === tema.id ? { ...t, theoryRead: true } : t));
        this.iniciarChatConContexto(tema);
        this.activePhase.set('amauta');
        this.markingTheory.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.activePhase.set('amauta');
        this.markingTheory.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Inline Amauta chat ─────────────────────────────────────────────────────

  private iniciarChatConContexto(tema: TemaConProgreso): void {
    if (this.chatInitialized) return;
    this.chatInitialized = true;
    this.chatLoading.set(true);

    this.chatService.createChat().subscribe({
      next: (chat) => {
        this.activeChatId = chat.id;
        // Send the context as a hidden system message by first sending Amauta's greeting
        const greeting: ChatMessage = {
          role: 'assistant',
          content: `¡Saludos, joven Chasqui! Has completado la lectura de **"${tema.title}"**. 🦅\n\n¿Tienes alguna duda sobre lo que acabas de aprender? Puedo ayudarte a entender mejor la teoría antes de que inicies tus misiones.`,
        };
        this.chatMessages.set([greeting]);
        this.chatLoading.set(false);
        this.cdr.detectChanges();
        this.scrollChatToBottom();
      },
      error: () => {
        const fallback: ChatMessage = {
          role: 'assistant',
          content: '¡Joven Chasqui! El camino estuvo lleno de obstáculos, pero Amauta siempre está aquí. ¿Qué duda tienes sobre la teoría?'
        };
        this.chatMessages.set([fallback]);
        this.chatLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  enviarMensajeAmauta(): void {
    const texto = this.chatInputText().trim();
    if (!texto || this.chatLoading()) return;

    const userMsg: ChatMessage = { role: 'user', content: texto };
    this.chatMessages.update(msgs => [...msgs, userMsg]);
    this.chatInputText.set('');
    this.chatLoading.set(true);
    this.cdr.detectChanges();
    this.scrollChatToBottom();

    const tema = this.getTemaActivo();
    const contextualMessage = tema
      ? `[Contexto del tema: "${tema.title}". ${tema.shortDescription ?? ''}]\n\n${texto}`
      : texto;

    if (this.activeChatId) {
      this.chatService.sendMessage(this.activeChatId, contextualMessage).subscribe({
        next: (data) => {
          const aiResponse = Array.isArray(data) ? data[data.length - 1] : data;
          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: aiResponse?.content ?? 'El camino hacia la sabiduría es largo, Chasqui. Intenta de nuevo.',
            id: aiResponse?.id
          };
          this.chatMessages.update(msgs => [...msgs, aiMsg]);
          this.chatLoading.set(false);
          this.cdr.detectChanges();
          this.scrollChatToBottom();
        },
        error: () => {
          const errMsg: ChatMessage = { role: 'assistant', content: 'El mensajero no pudo entregar tu pregunta. Intenta de nuevo.' };
          this.chatMessages.update(msgs => [...msgs, errMsg]);
          this.chatLoading.set(false);
          this.cdr.detectChanges();
        }
      });
    } else {
      // Fallback: create chat then send
      this.chatService.createChat().subscribe({
        next: (chat) => {
          this.activeChatId = chat.id;
          this.chatService.sendMessage(chat.id, contextualMessage).subscribe({
            next: (data) => {
              const aiResponse = Array.isArray(data) ? data[data.length - 1] : data;
              const aiMsg: ChatMessage = { role: 'assistant', content: aiResponse?.content ?? '...' };
              this.chatMessages.update(msgs => [...msgs, aiMsg]);
              this.chatLoading.set(false);
              this.cdr.detectChanges();
              this.scrollChatToBottom();
            },
            error: () => { this.chatLoading.set(false); this.cdr.detectChanges(); }
          });
        },
        error: () => { this.chatLoading.set(false); this.cdr.detectChanges(); }
      });
    }
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensajeAmauta();
    }
  }

  irAlChatCompleto(): void {
    this.router.navigate(['/student-chat']);
  }

  onSaltarAmauta(): void {
    this.activePhase.set('activities');
    this.cdr.detectChanges();
  }

  goToAmauta(): void {
    this.activePhase.set('amauta');
    this.cdr.detectChanges();
  }

  setPhase(phase: WizardPhase): void {
    const tema = this.getTemaActivo();
    if (!tema) return;

    // Solo permitir avanzar si se ha leído la teoría
    if (phase === 'amauta' || phase === 'activities') {
      if (!tema.theoryRead) return; // Bloqueado
    }

    this.activePhase.set(phase);
    this.cdr.detectChanges();
  }

  onVolverATeoria(): void {
    this.theoryScrollChecked = false;
    this.theoryScrolledToEnd.set(false);
    this.activePhase.set('theory');
    this.cdr.detectChanges();
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      const el = this.chatMessagesRef?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  // ── Activity actions ──────────────────────────────────────────────────────────

  iniciarActividad(actividad: ActividadConProgreso): void {
    this.router.navigate(['/estudiante/activity', actividad.id], {
      queryParams: { cursoId: this.cursoId(), capituloId: this.capituloId() }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  calcularProgreso(tema: TemaConProgreso): number {
    if (tema.activitiesToComplete === 0) return 0;
    return Math.min(100, Math.max(0, Math.round((tema.completedActivities / tema.activitiesToComplete) * 100)));
  }

  obtenerEstadoTema(tema: TemaConProgreso): 'completed' | 'in-progress' | 'ready-to-start' | 'locked' {
    if (tema.completedActivities === tema.activitiesToComplete && tema.activitiesToComplete > 0) return 'completed';
    if (tema.completedActivities > 0) return 'in-progress';
    if (tema.nextToStart) return 'ready-to-start';
    return 'locked';
  }

  volverAtras(): void {
    this.router.navigate(['/estudiante/cursos', this.cursoId(), 'capitulos']);
  }

  getPhaseIndex(): number {
    const map: Record<WizardPhase, number> = { theory: 0, amauta: 1, activities: 2 };
    return map[this.activePhase()];
  }
}
