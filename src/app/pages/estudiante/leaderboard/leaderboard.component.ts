import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LeaderboardService, 
  LeaderboardUser, 
  AdvancedLeaderboardUser, 
  AdvancedLeaderboardResponse, 
  LeaderboardOptions,
  Institution
} from '../../../core/services/leaderboard.service';
import { finalize } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    DatePickerModule,
    SelectModule,
    FormsModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  users: LeaderboardUser[] = [];
  advancedUsers: AdvancedLeaderboardUser[] = [];
  loading: boolean = true;
  
  // Opciones del leaderboard avanzado
  isAdvancedMode: boolean = false;
  selectedPeriod: string = 'all';
  selectedResourceType: string = 'yachay';
  selectedInstitutionId: number | null = null;
  dateRange: Date[] | null = null;
  
  periodOptions = [
    { label: 'Todos los tiempos', value: 'all' },
    { label: 'Hoy', value: 'today' },
    { label: 'Última semana', value: 'week' },
    { label: 'Último mes', value: 'month' },
    { label: 'Último año', value: 'year' },
    { label: 'Personalizado', value: 'custom' }
  ];
  
  resourceTypeOptions = [
    { label: 'Yachay (Conocimiento)', value: 'yachay' },
    { label: 'Tumis (Energía)', value: 'tumis' },
    { label: 'Mullu (Recompensa)', value: 'mullu' }
  ];

  institutions: Institution[] = [];
  
  meta: any = null;

  constructor(private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
    this.loadLeaderboard();
    this.loadInstitutions();
  }

  loadLeaderboard(): void {
    if (this.isAdvancedMode) {
      this.loadAdvancedLeaderboard();
    } else {
      this.loadBasicLeaderboard();
    }
  }

  loadInstitutions(): void {
    this.leaderboardService.getInstitutions()
      .subscribe({
        next: (data) => {
          this.institutions = data.data;
        },
        error: (error) => {
          console.error('Error al cargar instituciones', error);
        }
      });
  }

  loadBasicLeaderboard(): void {
    this.loading = true;
    this.leaderboardService.getLeaderboard()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.users = data.data;
        },
        error: (error) => {
          console.error('Error al cargar el leaderboard', error);
        }
      });
  }

  loadAdvancedLeaderboard(): void {
    this.loading = true;
    
    const options: LeaderboardOptions = {
      period: this.selectedPeriod === 'custom' ? 'all' : this.selectedPeriod,
      resourceType: this.selectedResourceType,
      institutionId: this.selectedInstitutionId || undefined,
      limit: 50
    };
    
    // Si es período personalizado y hay fechas seleccionadas
    if (this.selectedPeriod === 'custom' && this.dateRange && this.dateRange.length === 2) {
      options.startDate = this.dateRange[0].toISOString().split('T')[0];
      options.endDate = this.dateRange[1].toISOString().split('T')[0];
    }
    
    this.leaderboardService.getAdvancedLeaderboard(options)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.advancedUsers = data.data.users;
          this.meta = data.data.meta;
        },
        error: (error) => {
          console.error('Error al cargar el leaderboard avanzado', error);
        }
      });
  }

  toggleMode(): void {
    this.isAdvancedMode = !this.isAdvancedMode;
    this.loadLeaderboard();
  }

  onPeriodChange(): void {
    if (this.selectedPeriod !== 'custom') {
      this.dateRange = null;
    }
    this.loadAdvancedLeaderboard();
  }

  onResourceTypeChange(): void {
    this.loadAdvancedLeaderboard();
  }

  onInstitutionChange(): void {
    this.loadAdvancedLeaderboard();
  }

  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2) {
      this.loadAdvancedLeaderboard();
    }
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
    return 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 dark:from-slate-600 dark:to-slate-700 dark:text-slate-200';
  }

  getResourceIcon(resourceType: string): string {
    switch (resourceType) {
      case 'yachay': return '🧠';
      case 'tumis': return '⚡';
      case 'mullu': return '💎';
      default: return '🏆';
    }
  }

  getResourceLabel(resourceType: string): string {
    switch (resourceType) {
      case 'yachay': return 'Yachay';
      case 'tumis': return 'Tumis';
      case 'mullu': return 'Mullu';
      default: return 'Puntos';
    }
  }

  getResourceColor(resourceType: string): string {
    switch (resourceType) {
      case 'yachay': return 'text-blue-600 dark:text-blue-400';
      case 'tumis': return 'text-purple-600 dark:text-purple-400';
      case 'mullu': return 'text-pink-600 dark:text-pink-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getPeriodLabel(period: string): string {
    switch (period) {
      case 'today': return 'Hoy';
      case 'week': return 'Última semana';
      case 'month': return 'Último mes';
      case 'year': return 'Último año';
      case 'all': return 'Todos los tiempos';
      default: return period;
    }
  }

  getInstitutionName(institutionId: number | undefined): string | null {
    if (!institutionId) return null;
    const institution = this.institutions.find(i => i.id === institutionId);
    return institution?.name || null;
  }

  trackByUser(index: number, user: LeaderboardUser | AdvancedLeaderboardUser): number {
    return user.id;
  }
}
