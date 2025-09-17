import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$: Observable<MenuItem[]> = this.menuItemsSubject.asObservable();

  constructor(private authService: AuthService) {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateMenuByUserType(user.typeUser);
      } else {
        // Si no hay usuario, mostrar un menú vacío o por defecto
        this.menuItemsSubject.next([]);
      }
    });
  }

  /**
   * Actualiza el menú según el tipo de usuario
   * @param userType Tipo de usuario
   */
  updateMenuByUserType(userType: string): void {
    let menuItems: MenuItem[] = [];

    switch (userType) {
      case 'admin':
        menuItems = this.getAdminMenu();
        break;
      case 'teacher':
        menuItems = this.getTeacherMenu();
        break;
      case 'student':
        menuItems = this.getStudentMenu();
        break;
      case 'parent':
        menuItems = this.getParentMenu();
        break;
      default:
        menuItems = this.getDefaultMenu();
        break;
    }

    this.menuItemsSubject.next(menuItems);
  }

  /**
   * Obtiene el menú para administradores
   */
  private getAdminMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        items: [
          { label: 'Panel Principal', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
      {
        label: 'Administración',
        items: [
          { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
          { label: 'Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/admin/courses'] },
          { label: 'Capítulos', icon: 'pi pi-fw pi-bookmark', routerLink: ['/admin/chapters'] },
          { label: 'Temas', icon: 'pi pi-fw pi-list', routerLink: ['/admin/temas'] },
          { label: 'Estadísticas', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/admin/statistics'] }
        ]
      },
      {
        label: 'Configuración',
        items: [
          { label: 'Parámetros', icon: 'pi pi-fw pi-cog', routerLink: ['/admin/parameters'] },
          { label: 'Documentos', icon: 'pi pi-fw pi-file', routerLink: ['/admin/documents'] }
        ]
      },
      {
        label: 'Herramientas',
        items: [
          { label: 'Chat IA', icon: 'pi pi-fw pi-comments', routerLink: ['/chatgpt'] },
          { label: 'Comunidad', icon: 'pi pi-fw pi-users', routerLink: ['/community'] }
        ]
      },
      {
        label: 'Mi Cuenta',
        items: [
          { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] },
          { label: 'Cambiar Contraseña', icon: 'pi pi-fw pi-lock', routerLink: ['/profile/change-password'] }
        ]
      }
    ];
  }

  /**
   * Obtiene el menú para profesores
   */
  private getTeacherMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        items: [
          { label: 'Panel Principal', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
      {
        label: 'Docencia',
        items: [
          { label: 'Mis Clases', icon: 'pi pi-fw pi-briefcase', routerLink: ['/teacher/classes'] },
          { label: 'Evaluaciones', icon: 'pi pi-fw pi-check-square', routerLink: ['/teacher/assessments'] },
          { label: 'Estudiantes', icon: 'pi pi-fw pi-users', routerLink: ['/teacher/students'] }
        ]
      },
      {
        label: 'Contenido',
        items: [
          { label: 'Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/courses'] },
          { label: 'Materiales', icon: 'pi pi-fw pi-file', routerLink: ['/teacher/materials'] }
        ]
      },
      {
        label: 'Herramientas',
        items: [
          { label: 'Chat IA', icon: 'pi pi-fw pi-comments', routerLink: ['/chatgpt'] },
          { label: 'Comunidad', icon: 'pi pi-fw pi-users', routerLink: ['/community'] }
        ]
      },
      {
        label: 'Mi Cuenta',
        items: [
          { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] },
          { label: 'Cambiar Contraseña', icon: 'pi pi-fw pi-lock', routerLink: ['/profile/change-password'] }
        ]
      }
    ];
  }

  /**
   * Obtiene el menú para estudiantes
   */
  private getStudentMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        items: [
          { label: 'Panel Principal', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
      {
        label: 'Aprendizaje',
        items: [
          { label: 'Mis Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/estudiante/cursos'] },
          { label: 'Mis Clases', icon: 'pi pi-fw pi-briefcase', routerLink: ['/student/classes'] },
          { label: 'Evaluaciones', icon: 'pi pi-fw pi-check-square', routerLink: ['/student/assessments'] }
        ]
      },
      {
        label: 'Progreso',
        items: [
          { label: 'Estadísticas', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/student/statistics'] },
          { label: 'Logros', icon: 'pi pi-fw pi-trophy', routerLink: ['/student/achievements'] }
        ]
      },
      {
        label: 'Herramientas',
        items: [
          { label: 'Chat IA', icon: 'pi pi-fw pi-comments', routerLink: ['/chatgpt'] },
          { label: 'Comunidad', icon: 'pi pi-fw pi-users', routerLink: ['/community'] }
        ]
      },
      {
        label: 'Mi Cuenta',
        items: [
          { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] },
          { label: 'Cambiar Contraseña', icon: 'pi pi-fw pi-lock', routerLink: ['/profile/change-password'] }
        ]
      }
    ];
  }

  /**
   * Obtiene el menú para padres de familia
   */
  private getParentMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        items: [
          { label: 'Panel Principal', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
      {
        label: 'Seguimiento',
        items: [
          { label: 'Mis Hijos', icon: 'pi pi-fw pi-users', routerLink: ['/parent/children'] },
          { label: 'Progreso Académico', icon: 'pi pi-fw pi-chart-line', routerLink: ['/parent/progress'] },
          { label: 'Evaluaciones', icon: 'pi pi-fw pi-check-square', routerLink: ['/parent/assessments'] }
        ]
      },
      {
        label: 'Comunicación',
        items: [
          { label: 'Mensajes', icon: 'pi pi-fw pi-envelope', routerLink: ['/parent/messages'] },
          { label: 'Reuniones', icon: 'pi pi-fw pi-calendar', routerLink: ['/parent/meetings'] }
        ]
      },
      {
        label: 'Herramientas',
        items: [
          { label: 'Chat IA', icon: 'pi pi-fw pi-comments', routerLink: ['/chatgpt'] },
          { label: 'Comunidad', icon: 'pi pi-fw pi-users', routerLink: ['/community'] }
        ]
      },
      {
        label: 'Mi Cuenta',
        items: [
          { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] },
          { label: 'Cambiar Contraseña', icon: 'pi pi-fw pi-lock', routerLink: ['/profile/change-password'] }
        ]
      }
    ];
  }

  /**
   * Obtiene el menú por defecto (para usuarios no autenticados o sin tipo definido)
   */
  private getDefaultMenu(): MenuItem[] {
    return [
      {
        label: 'Home',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
      {
        label: 'Acceso',
        items: [
          { label: 'Iniciar Sesión', icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] },
          { label: 'Registrarse', icon: 'pi pi-fw pi-user-plus', routerLink: ['/auth/register'] }
        ]
      }
    ];
  }
}
