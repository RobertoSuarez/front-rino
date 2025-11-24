import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {
  private messageService = inject(MessageService);

  /**
   * Muestra un mensaje de bienvenida personalizado según el tipo de usuario
   * @param user Usuario que inicia sesión
   */
  showWelcomeMessage(user: User): void {
    const { firstName, lastName, typeUser } = user;
    const fullName = `${firstName} ${lastName}`.trim();

    // Mensajes personalizados por tipo de usuario
    const messages: { [key: string]: { title: string; message: string; icon: string } } = {
      student: {
        title: '¡Bienvenido de nuevo! 🎓',
        message: `Hola ${fullName}, ¡es un placer verte de nuevo! Continúa aprendiendo sobre ciberseguridad y demuestra tus habilidades.`,
        icon: 'pi-graduation-cap'
      },
      teacher: {
        title: '¡Bienvenido de nuevo! 👨‍🏫',
        message: `Hola ${fullName}, ¡qué bueno verte nuevamente! Accede a tus cursos y gestiona el aprendizaje de tus estudiantes.`,
        icon: 'pi-briefcase'
      },
      admin: {
        title: '¡Bienvenido de nuevo! 👨‍💼',
        message: `Hola ${fullName}, ¡es un honor contar contigo! Revisa las estadísticas y gestiona la plataforma.`,
        icon: 'pi-shield'
      }
    };

    // Obtener el mensaje según el tipo de usuario, con fallback a un mensaje genérico
    const welcomeData = messages[typeUser] || {
      title: '¡Bienvenido de nuevo! 👋',
      message: `Hola ${fullName}, ¡es un placer verte nuevamente en Cyber Imperium!`,
      icon: 'pi-check'
    };

    // Mostrar el toast con el mensaje de bienvenida
    this.messageService.add({
      severity: 'info',
      summary: welcomeData.title,
      detail: welcomeData.message,
      life: 5000, // Desaparece después de 5 segundos
      styleClass: 'welcome-toast'
    });
  }
}
