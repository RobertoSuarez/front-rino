import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface Achievement {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  status: 'locked' | 'unlocked' | 'in_progress';
  progress?: number;
  maxProgress?: number;
  unlockedDate?: Date;
  requirements?: string[];
  rewards?: string[];
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DialogModule,
    ProgressBarModule,
    BadgeModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class AchievementsComponent implements OnInit {
  achievements: Achievement[] = [];
  showDetailsDialog = false;
  selectedAchievement: Achievement | null = null;
  isLoading = false;
  activeFilter: 'all' | 'unlocked' | 'in_progress' | 'locked' = 'all';

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    console.log('AchievementsComponent initialized');
    this.loadAchievements();
  }

  private loadAchievements() {
    this.isLoading = true;

    // Mock data - replace with actual API call
    this.achievements = [
      {
        id: 1,
        title: 'Detector de Phishing',
        description: 'Maestro en identificar correos electrónicos fraudulentos y estafas digitales',
        category: 'Phishing y estafas digitales',
        icon: 'pi pi-shield',
        color: '#10b981',
        status: 'unlocked',
        unlockedDate: new Date('2024-11-15'),
        requirements: ['Completar curso de Phishing', 'Identificar 10 estafas correctamente'],
        rewards: ['Badge "Detector de Phishing"', '+50 puntos de experiencia'],
        rarity: 'rare'
      },
      {
        id: 2,
        title: 'Guardián Digital',
        description: 'Protector contra el grooming y acoso en línea para menores',
        category: 'Grooming',
        icon: 'pi pi-user',
        color: '#3b82f6',
        status: 'unlocked',
        unlockedDate: new Date('2024-11-20'),
        requirements: ['Completar módulo de Grooming', 'Reconocer 15 señales de alerta'],
        rewards: ['Badge "Guardián Digital"', '+75 puntos de experiencia'],
        rarity: 'epic'
      },
      {
        id: 3,
        title: 'Verificador de Identidad',
        description: 'Experto en detectar catfishing y suplantación de identidad',
        category: 'Catfishing',
        icon: 'pi pi-id-card',
        color: '#8b5cf6',
        status: 'in_progress',
        progress: 7,
        maxProgress: 10,
        requirements: ['Completar curso de Catfishing', 'Verificar 10 perfiles sospechosos'],
        rewards: ['Badge "Verificador de Identidad"', '+60 puntos de experiencia'],
        rarity: 'rare'
      },
      {
        id: 4,
        title: 'Embajador Digital Seguro',
        description: 'Campeón en la prevención del sexting y sextorsión',
        category: 'Sexting y sextorsión',
        icon: 'pi pi-lock',
        color: '#f59e0b',
        status: 'locked',
        requirements: ['Completar curso de Sexting', 'Pasar evaluación final con 90%'],
        rewards: ['Badge "Embajador Digital Seguro"', '+100 puntos de experiencia', 'Certificado especial'],
        rarity: 'legendary'
      },
      {
        id: 5,
        title: 'Protector contra la Trata',
        description: 'Defensor contra la trata de personas por medios digitales',
        category: 'Protección contra la trata de personas',
        icon: 'pi pi-handshake',
        color: '#dc2626',
        status: 'locked',
        requirements: ['Completar módulo de Trata Digital', 'Reportar 5 casos simulados'],
        rewards: ['Badge "Protector contra la Trata"', '+80 puntos de experiencia'],
        rarity: 'epic'
      },
      {
        id: 6,
        title: 'Ciberdefensor',
        description: 'Luchador contra el ciberacoso y flamming en línea',
        category: 'Prevención del ciberacoso (harassment) y flamming',
        icon: 'pi pi-comments',
        color: '#06b6d4',
        status: 'locked',
        requirements: ['Completar curso de Ciberacoso', 'Crear campaña anti-bullying'],
        rewards: ['Badge "Ciberdefensor"', '+70 puntos de experiencia'],
        rarity: 'rare'
      },
      {
        id: 7,
        title: 'Vigilante Digital',
        description: 'Especialista en protección contra el stalking digital',
        category: 'Protección contra el stalking digital',
        icon: 'pi pi-eye',
        color: '#7c3aed',
        status: 'locked',
        requirements: ['Completar módulo de Stalking', 'Configurar privacidad avanzada'],
        rewards: ['Badge "Vigilante Digital"', '+65 puntos de experiencia'],
        rarity: 'rare'
      },
      {
        id: 8,
        title: 'Centinela Cibernético',
        description: 'Guardia de seguridad contra delitos informáticos',
        category: 'Seguridad frente a delitos informáticos',
        icon: 'pi pi-exclamation-triangle',
        color: '#ea580c',
        status: 'locked',
        requirements: ['Completar curso de Delitos Informáticos', 'Resolver 10 casos prácticos'],
        rewards: ['Badge "Centinela Cibernético"', '+90 puntos de experiencia'],
        rarity: 'epic'
      },
      {
        id: 9,
        title: 'Hacker Ético',
        description: 'Experto en protección contra hacking y vulnerabilidades',
        category: 'Protección contra el hacking y vulnerabilidades',
        icon: 'pi pi-cog',
        color: '#0d9488',
        status: 'locked',
        requirements: ['Completar curso de Hacking Ético', 'Encontrar 15 vulnerabilidades'],
        rewards: ['Badge "Hacker Ético"', '+85 puntos de experiencia'],
        rarity: 'epic'
      },
      {
        id: 10,
        title: 'Defensor de la Inocencia',
        description: 'Protector contra la pornografía infantil y explotación sexual en línea',
        category: 'Prevención de la pornografía infantil y explotación sexual',
        icon: 'pi pi-heart',
        color: '#be185d',
        status: 'locked',
        requirements: ['Completar módulo de Protección Infantil', 'Crear material educativo'],
        rewards: ['Badge "Defensor de la Inocencia"', '+120 puntos de experiencia', 'Reconocimiento especial'],
        rarity: 'legendary'
      }
    ];
    this.isLoading = false;
  }

  viewAchievementDetails(achievement: Achievement) {
    this.selectedAchievement = achievement;
    this.showDetailsDialog = true;
  }

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedAchievement = null;
  }

  shareAchievement(achievement: Achievement) {
    this.messageService.add({
      severity: 'success',
      summary: '¡Compartido!',
      detail: `Has compartido el logro "${achievement.title}"`
    });
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'locked': 'pi pi-lock',
      'unlocked': 'pi pi-check-circle',
      'in_progress': 'pi pi-clock'
    };
    return icons[status] || 'pi pi-question-circle';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'locked': 'Bloqueado',
      'unlocked': 'Desbloqueado',
      'in_progress': 'En progreso'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'locked': '#64748b',
      'unlocked': '#10b981',
      'in_progress': '#3b82f6'
    };
    return colors[status] || '#64748b';
  }

  getRarityColor(rarity: string): string {
    const colors: { [key: string]: string } = {
      'common': '#64748b',
      'rare': '#3b82f6',
      'epic': '#8b5cf6',
      'legendary': '#f59e0b'
    };
    return colors[rarity] || '#64748b';
  }

  getRarityLabel(rarity: string): string {
    const labels: { [key: string]: string } = {
      'common': 'Común',
      'rare': 'Raro',
      'epic': 'Épico',
      'legendary': 'Legendario'
    };
    return labels[rarity] || rarity;
  }

  getProgressPercentage(achievement: Achievement): number {
    if (achievement.status === 'unlocked') return 100;
    if (achievement.status === 'locked') return 0;
    if (achievement.progress && achievement.maxProgress) {
      return (achievement.progress / achievement.maxProgress) * 100;
    }
    return 0;
  }

  getTotalAchievements(): number {
    return this.achievements.length;
  }

  getUnlockedAchievements(): number {
    return this.achievements.filter(a => a.status === 'unlocked').length;
  }

  getInProgressAchievements(): number {
    return this.achievements.filter(a => a.status === 'in_progress').length;
  }

  getAchievementCardClass(achievement: Achievement): string {
    return `achievement-card ${achievement.status}`;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'locked': 'badge-secondary',
      'unlocked': 'badge-success',
      'in_progress': 'badge-primary'
    };
    return classes[status] || 'badge-secondary';
  }

  getCompletionPercentage(): number {
    const total = this.getTotalAchievements();
    const unlocked = this.getUnlockedAchievements();
    return total > 0 ? Math.round((unlocked / total) * 100) : 0;
  }

  setActiveFilter(filter: 'all' | 'unlocked' | 'in_progress' | 'locked') {
    this.activeFilter = filter;
  }

  getFilteredAchievements() {
    switch (this.activeFilter) {
      case 'unlocked':
        return this.achievements.filter(a => a.status === 'unlocked');
      case 'in_progress':
        return this.achievements.filter(a => a.status === 'in_progress');
      case 'locked':
        return this.achievements.filter(a => a.status === 'locked');
      default:
        return this.achievements;
    }
  }

  getLockedAchievements(): number {
    return this.achievements.filter(a => a.status === 'locked').length;
  }

  getFilterLabel(filter: string): string {
    switch (filter) {
      case 'unlocked':
        return 'Desbloqueados';
      case 'in_progress':
        return 'En Progreso';
      case 'locked':
        return 'Bloqueados';
      default:
        return 'Todos';
    }
  }

  getEmptyStateTitle(): string {
    switch (this.activeFilter) {
      case 'unlocked':
        return 'No tienes logros desbloqueados';
      case 'in_progress':
        return 'No tienes logros en progreso';
      case 'locked':
        return 'Todos los logros están disponibles';
      default:
        return 'No tienes logros aún';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.activeFilter) {
      case 'unlocked':
        return '¡Completa cursos de ciberseguridad para ganar tus primeras insignias!';
      case 'in_progress':
        return 'No tienes logros en proceso. ¡Empieza un nuevo curso!';
      case 'locked':
        return '¡Felicitaciones! Has completado todos los logros disponibles.';
      default:
        return 'No hay logros disponibles en este momento.';
    }
  }
}
