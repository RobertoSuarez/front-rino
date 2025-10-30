import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AdminDashboardService, AdminDashboardStats } from '../../core/services/admin-dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        SkeletonModule,
        ToastModule,
        TagModule,
        AvatarModule,
        ButtonModule
    ],
    providers: [MessageService],
    template: `
        <div class="grid grid-cols-12 gap-4">
            <p-toast></p-toast>

            <div class="col-span-12">
                <h1 class="text-3xl font-bold text-900 mb-2">Dashboard del Administrador</h1>
                <p class="text-600">Vista general del sistema Cyber Imperium</p>
            </div>

            <ng-container *ngIf="loading">
                <div class="col-span-12 md:col-span-6 lg:col-span-3" *ngFor="let i of [1,2,3,4]">
                    <p-card><p-skeleton width="100%" height="100px"></p-skeleton></p-card>
                </div>
            </ng-container>

            <ng-container *ngIf="!loading && stats">
                <div class="col-span-12 md:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full bg-blue-500 dark:bg-gradient-to-br dark:from-blue-500 dark:to-blue-600">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium mb-2 text-900 dark:text-white/90">Total Usuarios</div>
                                <div class="text-4xl font-bold text-900 dark:text-white">{{ stats.users.total }}</div>
                                <div class="text-sm mt-2 text-700 dark:text-white/80">{{ stats.users.active }} activos</div>
                            </div>
                            <div class="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-white/20 border-round">
                                <i class="pi pi-users text-3xl text-blue-600 dark:text-white"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full bg-green-500 dark:bg-gradient-to-br dark:from-green-500 dark:to-green-600">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium mb-2 text-900 dark:text-white/90">Total Cursos</div>
                                <div class="text-4xl font-bold text-900 dark:text-white">{{ stats.content.courses }}</div>
                                <div class="text-sm mt-2 text-700 dark:text-white/80">{{ stats.content.chapters }} capítulos</div>
                            </div>
                            <div class="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-white/20 border-round">
                                <i class="pi pi-book text-3xl text-green-600 dark:text-white"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full bg-orange-500 dark:bg-gradient-to-br dark:from-orange-500 dark:to-orange-600">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium mb-2 text-900 dark:text-white/90">Rutas de Aprendizaje</div>
                                <div class="text-4xl font-bold text-900 dark:text-white">{{ stats.content.learningPaths }}</div>
                                <div class="text-sm mt-2 text-700 dark:text-white/80">{{ stats.subscriptions.active }} suscripciones</div>
                            </div>
                            <div class="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-white/20 border-round">
                                <i class="pi pi-sitemap text-3xl text-orange-600 dark:text-white"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full bg-purple-500 dark:bg-gradient-to-br dark:from-purple-500 dark:to-purple-600">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium mb-2 text-900 dark:text-white/90">Total Actividades</div>
                                <div class="text-4xl font-bold text-900 dark:text-white">{{ stats.content.activities }}</div>
                                <div class="text-sm mt-2 text-700 dark:text-white/80">{{ stats.content.temas }} temas</div>
                            </div>
                            <div class="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-white/20 border-round">
                                <i class="pi pi-check-square text-3xl text-purple-600 dark:text-white"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-6">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-6">
                                <h3 class="text-xl font-bold text-900 mb-1">Distribución de Usuarios</h3>
                                <p class="text-600 text-sm">Usuarios por tipo en el sistema</p>
                            </div>
                        </ng-template>
                        <p-chart *ngIf="usersChartData" type="doughnut" [data]="usersChartData" [options]="chartOptions" height="300px"></p-chart>
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-6">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-6">
                                <h3 class="text-xl font-bold text-900 mb-1">Contenido del Sistema</h3>
                                <p class="text-600 text-sm">Distribución de contenido educativo</p>
                            </div>
                        </ng-template>
                        <p-chart *ngIf="contentChartData" type="bar" [data]="contentChartData" [options]="barChartOptions" height="300px"></p-chart>
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-6">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-6">
                                <h3 class="text-xl font-bold text-900 mb-1">Rutas Más Populares</h3>
                                <p class="text-600 text-sm">Top 5 rutas con más suscripciones</p>
                            </div>
                        </ng-template>
                        <div class="space-y-3" *ngIf="stats.popularPaths.length > 0">
                            <div *ngFor="let path of stats.popularPaths; let i = index" 
                                 class="flex items-center gap-3 p-3 border-1 surface-border border-round hover:bg-gray-50 transition-colors cursor-pointer"
                                 (click)="goToPath(path.id)">
                                <div class="flex items-center justify-center w-10 h-10 bg-primary text-white border-round font-bold">{{ i + 1 }}</div>
                                <div class="flex-1">
                                    <div class="font-semibold text-900">{{ path.name }}</div>
                                    <div class="text-sm text-600">{{ path.code }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-primary text-lg">{{ path.subscriptionsCount }}</div>
                                    <div class="text-xs text-600">estudiantes</div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="stats.popularPaths.length === 0" class="text-center py-8 text-600">
                            <i class="pi pi-inbox text-4xl mb-3"></i>
                            <p>No hay rutas disponibles</p>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-6">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-6 flex justify-between items-center">
                                <div>
                                    <h3 class="text-xl font-bold text-900 mb-1">Usuarios Recientes</h3>
                                    <p class="text-600 text-sm">Últimos usuarios registrados</p>
                                </div>
                                <button pButton label="Ver Todos" icon="pi pi-arrow-right" class="p-button-text p-button-sm" (click)="goToUsers()"></button>
                            </div>
                        </ng-template>
                        <div class="space-y-3" *ngIf="stats.recentUsers.length > 0">
                            <div *ngFor="let user of stats.recentUsers" class="flex items-center gap-3 p-3 border-1 surface-border border-round">
                                <p-avatar [image]="user.urlAvatar" [label]="user.firstName.charAt(0) + user.lastName.charAt(0)" size="large" shape="circle"></p-avatar>
                                <div class="flex-1">
                                    <div class="font-semibold text-900">{{ user.firstName }} {{ user.lastName }}</div>
                                    <div class="text-sm text-600">{{ user.email }}</div>
                                    <div class="text-xs text-500">{{ user.createdAt }}</div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <p-tag [value]="getUserTypeLabel(user.typeUser)" [severity]="getUserTypeSeverity(user.typeUser)"></p-tag>
                                    <p-tag [value]="user.status" [severity]="user.status === 'active' ? 'success' : 'danger'" styleClass="text-xs"></p-tag>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="stats.recentUsers.length === 0" class="text-center py-8 text-600">
                            <i class="pi pi-users text-4xl mb-3"></i>
                            <p>No hay usuarios recientes</p>
                        </div>
                    </p-card>
                </div>
            </ng-container>
        </div>
    `
})
export class Dashboard implements OnInit {
    stats: AdminDashboardStats | null = null;
    loading = false;
    usersChartData: any;
    contentChartData: any;
    chartOptions: any;
    barChartOptions: any;

    constructor(
        private dashboardService: AdminDashboardService,
        private messageService: MessageService,
        private router: Router,
        private authService: AuthService
    ) {
        this.initChartOptions();
    }

    ngOnInit(): void {
        // Verificar que el usuario sea admin
        this.authService.currentUser$.subscribe(user => {
            if (!user || user.typeUser !== 'admin') {
                // Si no es admin, redirigir a su dashboard correspondiente
                if (user?.typeUser === 'student') {
                    this.router.navigate(['/estudiante/cursos']);
                } else if (user?.typeUser === 'teacher') {
                    this.router.navigate(['/teacher/dashboard']);
                } else {
                    this.router.navigate(['/auth/login']);
                }
                return;
            }
            // Solo cargar si es admin
            if (user.typeUser === 'admin') {
                this.loadDashboardStats();
            }
        });
    }

    loadDashboardStats(): void {
        this.loading = true;
        this.dashboardService.getDashboardStats().subscribe({
            next: (response) => {
                this.stats = response.data;
                this.prepareCharts();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las estadísticas'
                });
                this.loading = false;
            }
        });
    }

    prepareCharts(): void {
        if (!this.stats) return;

        this.usersChartData = {
            labels: this.stats.usersByType.map(item => item.type),
            datasets: [{
                data: this.stats.usersByType.map(item => item.count),
                backgroundColor: ['#EF4444', '#8B5CF6', '#3B82F6'],
                hoverBackgroundColor: ['#DC2626', '#7C3AED', '#2563EB']
            }]
        };

        this.contentChartData = {
            labels: this.stats.contentStats.map(item => item.category),
            datasets: [{
                label: 'Cantidad',
                data: this.stats.contentStats.map(item => item.count),
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1
            }]
        };
    }

    initChartOptions(): void {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        };

        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        };
    }

    getUserTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            'admin': 'Admin',
            'teacher': 'Profesor',
            'student': 'Estudiante'
        };
        return labels[type] || type;
    }

    getUserTypeSeverity(type: string): string {
        const severities: { [key: string]: string } = {
            'admin': 'danger',
            'teacher': 'warning',
            'student': 'info'
        };
        return severities[type] || 'secondary';
    }

    goToPath(pathId: number): void {
        this.router.navigate(['/admin/learning-paths', pathId]);
    }

    goToUsers(): void {
        this.router.navigate(['/admin/users']);
    }
}
