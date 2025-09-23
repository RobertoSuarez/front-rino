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
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';

interface Evaluation {
  id: number;
  title: string;
  description: string;
  subject: string;
  className: string;
  teacher: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  score?: number;
  maxScore: number;
  questionsCount: number;
  timeLimit?: number; // in minutes
  instructions?: string;
  topics?: string[];
  difficulty?: 'Fácil' | 'Intermedio' | 'Difícil';
  attemptsAllowed?: number;
  attemptsUsed?: number;
  color?: string;
}

@Component({
  selector: 'app-evaluations',
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
    ConfirmDialogModule,
    ProgressBarModule,
    BadgeModule
  ],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];
  showDetailsDialog = false;
  selectedEvaluation: Evaluation | null = null;
  menuItems: any[] = [];
  activeFilter: 'all' | 'pending' | 'completed' = 'all';
  isLoading = false;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    console.log('EvaluationsComponent initialized');
    this.loadEvaluations();
  }

  private loadEvaluations() {
    this.isLoading = true;

    // Mock data - replace with actual API call
    this.evaluations = [
      {
        id: 1,
        title: 'Evaluación de Introducción a la Ciberseguridad',
        description: 'Evaluación sobre conceptos básicos de seguridad en internet y protección de datos personales.',
        subject: 'Ciberseguridad',
        className: 'Introducción a la Ciberseguridad',
        teacher: 'Prof. Carlos Mendoza',
        dueDate: new Date('2024-12-20'),
        status: 'pending',
        maxScore: 100,
        questionsCount: 25,
        timeLimit: 45,
        instructions: 'Lee cuidadosamente cada pregunta. Tienes 45 minutos para completar la evaluación.',
        topics: ['Conceptos básicos', 'Amenazas comunes', 'Protección de datos'],
        difficulty: 'Fácil',
        attemptsAllowed: 2,
        attemptsUsed: 0,
        color: '#4CAF50'
      },
      {
        id: 2,
        title: 'Quiz de Navegación Segura',
        description: 'Evaluación práctica sobre identificación de sitios web seguros y navegación responsable.',
        subject: 'Ciberseguridad',
        className: 'Navegación Segura en Internet',
        teacher: 'Prof. Ana García',
        dueDate: new Date('2024-12-15'),
        status: 'in_progress',
        maxScore: 100,
        questionsCount: 20,
        timeLimit: 30,
        instructions: 'Esta evaluación incluye preguntas de selección múltiple y casos prácticos.',
        topics: ['HTTPS', 'Phishing', 'Extensiones de seguridad'],
        difficulty: 'Intermedio',
        attemptsAllowed: 1,
        attemptsUsed: 1,
        color: '#2196F3'
      },
      {
        id: 3,
        title: 'Proyecto Final: Seguridad Personal',
        description: 'Evaluación completa sobre contraseñas seguras y configuración de privacidad.',
        subject: 'Ciberseguridad',
        className: 'Protege tu Información Personal',
        teacher: 'Prof. Roberto Silva',
        dueDate: new Date('2024-12-10'),
        status: 'completed',
        score: 95,
        maxScore: 100,
        questionsCount: 15,
        timeLimit: 60,
        instructions: 'Proyecto práctico que incluye creación de contraseñas y configuración de cuentas.',
        topics: ['Gestores de contraseñas', 'Configuración de privacidad', 'Buenas prácticas'],
        difficulty: 'Difícil',
        attemptsAllowed: 3,
        attemptsUsed: 1,
        color: '#FF9800'
      },
      {
        id: 4,
        title: 'Evaluación de Recuperación',
        description: 'Evaluación adicional para reforzar conceptos aprendidos.',
        subject: 'Ciberseguridad',
        className: 'Introducción a la Ciberseguridad',
        teacher: 'Prof. Carlos Mendoza',
        dueDate: new Date('2024-12-05'),
        status: 'overdue',
        maxScore: 100,
        questionsCount: 30,
        timeLimit: 50,
        instructions: 'Evaluación de recuperación - última oportunidad.',
        topics: ['Repaso general', 'Casos prácticos'],
        difficulty: 'Intermedio',
        attemptsAllowed: 1,
        attemptsUsed: 0,
        color: '#DC2626'
      }
    ];
    this.isLoading = false;
  }

  viewEvaluationDetails(evaluation: Evaluation) {
    this.selectedEvaluation = evaluation;
    this.showDetailsDialog = true;
  }

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedEvaluation = null;
  }

  startEvaluation(evaluation: Evaluation) {
    if (evaluation.status === 'completed') {
      this.messageService.add({
        severity: 'info',
        summary: 'Evaluación completada',
        detail: 'Ya has completado esta evaluación'
      });
      return;
    }

    if (evaluation.status === 'overdue') {
      this.messageService.add({
        severity: 'error',
        summary: 'Evaluación vencida',
        detail: 'Esta evaluación ya no está disponible'
      });
      return;
    }

    // Navigate to evaluation taking page or open modal
    this.messageService.add({
      severity: 'success',
      summary: 'Iniciando evaluación',
      detail: `Comenzando "${evaluation.title}"`
    });
  }

  showOptionsMenu(event: Event, evaluation: Evaluation) {
    this.menuItems = [
      {
        label: 'Ver Detalles',
        icon: 'pi pi-eye',
        command: () => this.viewEvaluationDetails(evaluation)
      },
      {
        label: 'Marcar como Importante',
        icon: 'pi pi-star',
        command: () => this.markAsImportant(evaluation)
      }
    ];

    // For completed evaluations, add option to view results
    if (evaluation.status === 'completed') {
      this.menuItems.unshift({
        label: 'Ver Resultados',
        icon: 'pi pi-chart-bar',
        command: () => this.viewResults(evaluation)
      });
    }

    // For pending evaluations, add start option
    if (evaluation.status === 'pending' || evaluation.status === 'overdue') {
      this.menuItems.unshift({
        label: 'Comenzar Evaluación',
        icon: 'pi pi-play',
        command: () => this.startEvaluation(evaluation)
      });
    }

    // Note: In a real implementation, you'd use a menu component here
    this.viewEvaluationDetails(evaluation);
  }

  markAsImportant(evaluation: Evaluation) {
    this.messageService.add({
      severity: 'success',
      summary: 'Marcada como importante',
      detail: `"${evaluation.title}" ha sido marcada como importante`
    });
  }

  viewResults(evaluation: Evaluation) {
    this.messageService.add({
      severity: 'info',
      summary: 'Resultados',
      detail: `Puntuación obtenida: ${evaluation.score}/${evaluation.maxScore} puntos`
    });
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'pi pi-clock',
      'in_progress': 'pi pi-play-circle',
      'completed': 'pi pi-check-circle',
      'overdue': 'pi pi-exclamation-triangle'
    };
    return icons[status] || 'pi pi-question-circle';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En progreso',
      'completed': 'Completada',
      'overdue': 'Vencida'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#64748b',
      'in_progress': '#3b82f6',
      'completed': '#10b981',
      'overdue': '#dc2626'
    };
    return colors[status] || '#64748b';
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'badge-secondary',
      'in_progress': 'badge-primary',
      'completed': 'badge-success',
      'overdue': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  getProgressBarClass(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'progress-excellent';
    if (percentage >= 80) return 'progress-good';
    if (percentage >= 70) return 'progress-average';
    return 'progress-poor';
  }

  getPendingCount(): number {
    return this.evaluations.filter(e => e.status === 'pending' || e.status === 'overdue').length;
  }

  getCompletedCount(): number {
    return this.evaluations.filter(e => e.status === 'completed').length;
  }

  getProgressPercentage(evaluation: Evaluation): number {
    if (evaluation.status === 'completed' && evaluation.score !== undefined) {
      return (evaluation.score / evaluation.maxScore) * 100;
    }
    return 0;
  }

  getAverageScore(): string {
    const completed = this.evaluations.filter(e => e.status === 'completed' && e.score !== undefined);
    if (completed.length === 0) return '0%';

    const totalScore = completed.reduce((sum, e) => sum + (e.score! / e.maxScore) * 100, 0);
    return Math.round(totalScore / completed.length) + '%';
  }

  setActiveFilter(filter: 'all' | 'pending' | 'completed') {
    this.activeFilter = filter;
  }

  getFilteredEvaluations() {
    switch (this.activeFilter) {
      case 'pending':
        return this.evaluations.filter(e => e.status === 'pending' || e.status === 'overdue');
      case 'completed':
        return this.evaluations.filter(e => e.status === 'completed');
      default:
        return this.evaluations;
    }
  }

  getFilterLabel(filter: string): string {
    switch (filter) {
      case 'pending':
        return 'Pendientes';
      case 'completed':
        return 'Completadas';
      default:
        return 'Todas';
    }
  }

  getEmptyStateTitle(): string {
    switch (this.activeFilter) {
      case 'pending':
        return 'No tienes evaluaciones pendientes';
      case 'completed':
        return 'No tienes evaluaciones completadas';
      default:
        return 'No tienes evaluaciones';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.activeFilter) {
      case 'pending':
        return '¡Felicitaciones! Has completado todas tus evaluaciones pendientes.';
      case 'completed':
        return 'Aún no has completado ninguna evaluación.';
      default:
        return 'No hay evaluaciones disponibles en este momento.';
    }
  }
}
