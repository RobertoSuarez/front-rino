import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';

// Servicios
import { CursosService } from '../../../core/services';

// Interfaces
interface Curso {
  id: number;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  progreso: number;
  capitulos: any[];
  capitulosCompletados: number;
  temasCompletados: number;
  totalTemas: number;
  actividadesCompletadas: number;
  totalActividades: number;
  puntuacionPromedio: number;
  recursos: any[];
}

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    TreeModule,
    AccordionModule,
    DividerModule,
    BadgeModule,
    SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './curso-detalle.component.html',
  styleUrls: ['./curso-detalle.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CursoDetalleComponent implements OnInit {
  cursoId: number = 0;
  curso: any = null;
  estructuraCurso: TreeNode[] = [];
  contenidoActual: any = null;
  tipoContenido: string = 'tema'; // 'tema' o 'actividad'
  loading: boolean = true;
  loadingContenido: boolean = false;

  private route = inject(ActivatedRoute);
  private cursosService = inject(CursosService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cursoId = +params['id'];
      this.cargarDetalleCurso();
    });
  }

  cargarDetalleCurso() {
    this.loading = true;
    this.cursosService.getDetalleCurso(this.cursoId).subscribe({
      next: (data: any) => {
        this.curso = data;
        this.construirEstructuraCurso();
        this.loading = false;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del curso'
        });
        console.error('Error al cargar detalle del curso', error);
        this.loading = false;
      }
    });
  }

  construirEstructuraCurso() {
    if (!this.curso || !this.curso.capitulos) return;

    this.estructuraCurso = this.curso.capitulos.map((capitulo: any) => {
      const nodoCapitulo: TreeNode = {
        key: `capitulo_${capitulo.id}`,
        label: capitulo.title,
        data: {
          id: capitulo.id,
          tipo: 'capitulo',
          progreso: capitulo.progreso || 0
        },
        expandedIcon: 'pi pi-folder-open',
        collapsedIcon: 'pi pi-folder',
        children: []
      };

      if (capitulo.temas && capitulo.temas.length > 0) {
        nodoCapitulo.children = capitulo.temas.map((tema: any) => {
          const nodoTema: TreeNode = {
            key: `tema_${tema.id}`,
            label: tema.title,
            data: {
              id: tema.id,
              tipo: 'tema',
              progreso: tema.progreso || 0,
              completado: tema.completado || false
            },
            icon: tema.completado ? 'pi pi-check-circle text-green-500' : 'pi pi-file',
            children: []
          };

          if (tema.actividades && tema.actividades.length > 0) {
            nodoTema.children = tema.actividades.map((actividad: any) => {
              return {
                key: `actividad_${actividad.id}`,
                label: actividad.title,
                data: {
                  id: actividad.id,
                  tipo: 'actividad',
                  progreso: actividad.progreso || 0,
                  completado: actividad.completado || false,
                  score: actividad.score
                },
                icon: actividad.completado ? 'pi pi-check-circle text-green-500' : 'pi pi-pencil'
              };
            });
          }

          return nodoTema;
        });
      }

      return nodoCapitulo;
    });

    // Si hay capítulos, cargar el primer tema por defecto
    if (this.estructuraCurso.length > 0 && 
        this.estructuraCurso[0].children && 
        this.estructuraCurso[0].children.length > 0) {
      const primerTema = this.estructuraCurso[0].children[0];
      this.seleccionarNodo(primerTema);
    }
  }

  seleccionarNodo(nodo: TreeNode) {
    if (!nodo || !nodo.data) return;

    this.loadingContenido = true;
    this.tipoContenido = nodo.data.tipo;

    if (nodo.data.tipo === 'tema') {
      this.cursosService.getContenidoTema(nodo.data.id).subscribe({
        next: (data: any) => {
          this.contenidoActual = data;
          this.loadingContenido = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el contenido del tema'
          });
          console.error('Error al cargar contenido del tema', error);
          this.loadingContenido = false;
        }
      });
    } else if (nodo.data.tipo === 'actividad') {
      this.cursosService.getContenidoActividad(nodo.data.id).subscribe({
        next: (data: any) => {
          this.contenidoActual = data;
          this.loadingContenido = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la actividad'
          });
          console.error('Error al cargar actividad', error);
          this.loadingContenido = false;
        }
      });
    }
  }

  marcarComoCompletado() {
    if (!this.contenidoActual) return;

    if (this.tipoContenido === 'tema') {
      this.cursosService.marcarTemaCompletado(this.contenidoActual.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tema marcado como completado'
          });
          this.actualizarProgresoEnEstructura();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo marcar el tema como completado'
          });
          console.error('Error al marcar tema como completado', error);
        }
      });
    }
  }

  enviarRespuestasActividad(respuestas: any) {
    if (!this.contenidoActual) return;

    this.cursosService.enviarRespuestasActividad(this.contenidoActual.id, respuestas).subscribe({
      next: (resultado: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Actividad completada. Puntuación: ${resultado.score}`
        });
        this.contenidoActual.resultado = resultado;
        this.actualizarProgresoEnEstructura();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron enviar las respuestas'
        });
        console.error('Error al enviar respuestas', error);
      }
    });
  }

  actualizarProgresoEnEstructura() {
    // Recargar el curso para actualizar el progreso
    this.cargarDetalleCurso();
  }

  // Estado para controlar qué ejercicios están abiertos
  ejerciciosAbiertos: Set<number> = new Set([0]); // Por defecto, el primer ejercicio está abierto

  toggleEjercicio(index: number) {
    if (this.isEjercicioOpen(index)) {
      this.ejerciciosAbiertos.delete(index);
    } else {
      this.ejerciciosAbiertos.add(index);
    }
  }

  isEjercicioOpen(index: number): boolean {
    return this.ejerciciosAbiertos.has(index);
  }

  navegarAnterior() {
    // Implementar navegación al tema/actividad anterior
  }

  navegarSiguiente() {
    // Implementar navegación al siguiente tema/actividad
  }
}
