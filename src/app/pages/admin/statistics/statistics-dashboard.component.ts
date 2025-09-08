import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatisticsService } from '../../../core/services/admin-statistics.service';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-statistics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    TableModule,
    ButtonModule,
    FormsModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class StatisticsDashboardComponent implements OnInit {
  // Dashboard general
  dashboardStats: any = null;
  loading = true;
  
  // Gráficos
  usersGrowthData: any;
  activeUsersData: any;
  usersByTypeData: any;
  courseCompletionData: any;
  topCoursesData: any;
  activitySuccessData: any;
  accessFrequencyData: any;
  
  // Opciones de período
  periodOptions = [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' }
  ];
  selectedPeriod = 'monthly';
  
  // Opciones de gráficos
  chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef'
        }
      },
      y: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef'
        }
      }
    }
  };
  
  constructor(
    private adminStatisticsService: AdminStatisticsService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadDashboardStats();
    this.loadUsersGrowth();
    this.loadActiveUsers();
    this.loadUsersStats();
    this.loadCoursesCompletion();
    this.loadPopularCourses();
    this.loadActivitiesSuccess();
    this.loadAccessFrequency();
  }

  loadDashboardStats() {
    this.loading = true;
    this.adminStatisticsService.getDashboardStats().subscribe({
      next: (data) => {
        if (data) {
          // Asegurarse de que todos los campos existan
          this.dashboardStats = {
            totalUsers: data.totalUsers || 0,
            totalCourses: data.totalCourses || 0,
            totalChapters: data.totalChapters || 0,
            totalTemas: data.totalTemas || 0,
            totalActivities: data.totalActivities || 0,
            newUsersLastMonth: data.newUsersLastMonth || 0,
            activeUsers: data.activeUsers || 0,
            avgScore: data.avgScore || '0.00',
            topCourses: data.topCourses || [],
            studentProgress: data.studentProgress || [],
            resourceUsage: data.resourceUsage || []
          };
        } else {
          // Valores por defecto si no hay datos
          this.dashboardStats = {
            totalUsers: 0,
            totalCourses: 0,
            totalChapters: 0,
            totalTemas: 0,
            totalActivities: 0,
            newUsersLastMonth: 0,
            activeUsers: 0,
            avgScore: '0.00',
            topCourses: [],
            studentProgress: [],
            resourceUsage: []
          };
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar estadísticas del dashboard'
        });
        console.error('Error al cargar estadísticas del dashboard', error);
        this.loading = false;
        
        // Valores por defecto en caso de error
        this.dashboardStats = {
          totalUsers: 0,
          totalCourses: 0,
          totalChapters: 0,
          totalTemas: 0,
          totalActivities: 0,
          newUsersLastMonth: 0,
          activeUsers: 0,
          avgScore: '0.00',
          topCourses: [],
          studentProgress: [],
          resourceUsage: []
        };
      }
    });
  }

  loadUsersGrowth() {
    this.adminStatisticsService.getUsersGrowth(this.selectedPeriod).subscribe({
      next: (data: any[]) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const labels = data.map((item: any) => item.period);
          const values = data.map((item: any) => item.count);
          
          this.usersGrowthData = {
            labels: labels,
            datasets: [
              {
                label: 'Nuevos usuarios',
                data: values,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.4
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.usersGrowthData = {
            labels: [],
            datasets: [{ label: 'Nuevos usuarios', data: [], fill: true, backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgb(75, 192, 192)', tension: 0.4 }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar crecimiento de usuarios', error);
      }
    });
  }

  loadActiveUsers() {
    this.adminStatisticsService.getActiveUsers(this.selectedPeriod).subscribe({
      next: (data: any[]) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const labels = data.map((item: any) => item.period);
          const values = data.map((item: any) => item.count);
          
          this.activeUsersData = {
            labels: labels,
            datasets: [
              {
                label: 'Usuarios activos',
                data: values,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.4
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.activeUsersData = {
            labels: [],
            datasets: [{ label: 'Usuarios activos', data: [], fill: true, backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)', tension: 0.4 }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar usuarios activos', error);
      }
    });
  }

  loadUsersStats() {
    this.adminStatisticsService.getUsersStats().subscribe({
      next: (data: any) => {
        if (data && data.usersByType && Array.isArray(data.usersByType) && data.usersByType.length > 0) {
          const labels = data.usersByType.map((item: any) => item.type || 'Sin tipo');
          const values = data.usersByType.map((item: any) => parseInt(item.count || '0'));
          
          this.usersByTypeData = {
            labels: labels,
            datasets: [
              {
                data: values,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF'
                ],
                hoverBackgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF'
                ]
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.usersByTypeData = {
            labels: ['Sin datos'],
            datasets: [{ data: [0], backgroundColor: ['#CCCCCC'], hoverBackgroundColor: ['#CCCCCC'] }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de usuarios', error);
      }
    });
  }

  loadCoursesCompletion() {
    this.adminStatisticsService.getCoursesCompletion().subscribe({
      next: (data: any[]) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const labels = data.map((item: any) => item.courseTitle || 'Sin título');
          const values = data.map((item: any) => parseFloat(item.avgCompletion || '0'));
          
          this.courseCompletionData = {
            labels: labels,
            datasets: [
              {
                label: 'Porcentaje de finalización',
                data: values,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.courseCompletionData = {
            labels: [],
            datasets: [{ label: 'Porcentaje de finalización', data: [], backgroundColor: 'rgba(255, 159, 64, 0.2)', borderColor: 'rgb(255, 159, 64)', borderWidth: 1 }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar finalización de cursos', error);
      }
    });
  }

  loadPopularCourses() {
    this.adminStatisticsService.getPopularCourses().subscribe({
      next: (data: any[]) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const labels = data.map((item: any) => item.title || 'Sin título');
          const values = data.map((item: any) => parseInt(item.userCount || '0'));
          
          this.topCoursesData = {
            labels: labels,
            datasets: [
              {
                label: 'Número de usuarios',
                data: values,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.topCoursesData = {
            labels: [],
            datasets: [{ label: 'Número de usuarios', data: [], backgroundColor: 'rgba(153, 102, 255, 0.2)', borderColor: 'rgb(153, 102, 255)', borderWidth: 1 }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar cursos populares', error);
      }
    });
  }

  loadActivitiesSuccess() {
    this.adminStatisticsService.getActivitiesSuccess().subscribe({
      next: (data: any) => {
        if (data && data.mostSuccessful && Array.isArray(data.mostSuccessful) && data.mostSuccessful.length > 0) {
          const labels = data.mostSuccessful.map((item: any) => item.activityTitle || 'Sin título');
          const values = data.mostSuccessful.map((item: any) => parseFloat(item.successRate || '0'));
          
          this.activitySuccessData = {
            labels: labels,
            datasets: [
              {
                label: 'Tasa de éxito (%)',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.activitySuccessData = {
            labels: [],
            datasets: [{ label: 'Tasa de éxito (%)', data: [], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgb(75, 192, 192)', borderWidth: 1 }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar éxito de actividades', error);
      }
    });
  }

  loadAccessFrequency() {
    this.adminStatisticsService.getAccessFrequency().subscribe({
      next: (data: any) => {
        if (data && data.byDayOfWeek && Array.isArray(data.byDayOfWeek) && data.byDayOfWeek.length > 0) {
          const labels = data.byDayOfWeek.map((item: any) => item.day || 'Sin día');
          const values = data.byDayOfWeek.map((item: any) => item.count || 0);
          
          this.accessFrequencyData = {
            labels: labels,
            datasets: [
              {
                label: 'Frecuencia de acceso',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
              }
            ]
          };
        } else {
          // Si no hay datos, mostrar un gráfico vacío
          this.accessFrequencyData = {
            labels: [],
            datasets: [{ label: 'Frecuencia de acceso', data: [], backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)', borderWidth: 1 }]
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar frecuencia de acceso', error);
      }
    });
  }

  onPeriodChange() {
    this.loadUsersGrowth();
    this.loadActiveUsers();
  }
}
