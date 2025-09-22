import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService, LeaderboardUser } from '../../../core/services/leaderboard.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  users: LeaderboardUser[] = [];
  loading: boolean = true;
  // Ya no necesitamos opciones de ordenamiento ni selectedSortOption

  constructor(private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
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

  trackByUser(index: number, user: LeaderboardUser): number {
    return user.id;
  }
}
