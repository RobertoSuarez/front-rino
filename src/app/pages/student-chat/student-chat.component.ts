import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentChatService } from '../../core/services/student-chat.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { SharedModule } from '../../shared/shared.module';
import { Subscription } from 'rxjs';

interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

interface Message {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

@Component({
  selector: 'app-student-chat',
  templateUrl: './student-chat.component.html',
  styleUrls: ['./student-chat.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    ToastModule,
    RippleModule,
    SharedModule,
    DialogModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudentChatComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  
  // Variables para el modal de edición de título
  editTitleDialogVisible = false;
  newChatTitle = '';
  editingChatId: number | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = false;
  private hasLoadedChats = false;
  isSending = false;
  private userSubscription?: Subscription;

  @ViewChild('messageInput') messageInput?: ElementRef<HTMLInputElement>;

  constructor(
    private studentChatService: StudentChatService,
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        if (!this.hasLoadedChats) {
          this.hasLoadedChats = true;
          this.loadChats();
        }

        this.focusMessageInput();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'No Autenticado',
          detail: 'Debes iniciar sesión para acceder al chat.',
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  startNewChat(): void {
    // Limpiar mensajes y estado actual antes de iniciar un nuevo chat
    this.messages = [];
    this.newMessage = '';
    this.isSending = false;
    this.selectedChat = null;
    
    // Mostrar indicador de carga
    this.loading = true;
    
    // Inicializar nuevo chat
    this.initializeChat();
  }

  initializeChat(): void {
    this.loading = true;
    this.studentChatService.createChat().subscribe({
      next: (data) => {
        this.selectedChat = data;
        this.messages = [];
        this.upsertChat(data);
        this.loading = false;
        this.focusMessageInput();
      },
      error: (err) => {
        console.error('Error al inicializar chat', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Autenticación',
          detail:
            err.message ||
            'No se pudo inicializar el chat. Verifica que estés logueado como estudiante.',
        });
        this.loading = false;
      },
    });
  }

  sendQuickMessage(message: string): void {
    this.newMessage = message;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      this.focusMessageInput();
      return;
    }

    if (!this.selectedChat) {
      this.createChatAndSendMessage();
    } else {
      this.performSendMessage();
    }
  }

  selectChat(chat: Chat): void {
    // Si ya está seleccionado, solo enfoca el input
    if (this.selectedChat?.id === chat.id) {
      this.focusMessageInput();
      return;
    }

    // Limpiar estado actual
    this.newMessage = '';
    this.isSending = false;
    this.messages = [];
    
    // Mostrar indicador de carga
    this.loading = true;
    
    // Actualizar chat seleccionado
    this.selectedChat = chat;
    
    // Cargar mensajes del chat seleccionado
    this.loadMessages(chat.id);
    
    // Actualizar la posición del chat en la lista (moverlo al principio)
    this.upsertChat(chat);
  }

  private loadChats(): void {
    this.loading = true;
    this.studentChatService.getChats().subscribe({
      next: (data) => {
        this.chats = data;

        if (data.length > 0) {
          this.selectedChat = data[0];
          this.messages = [];
          this.loadMessages(data[0].id);
          return;
        }

        this.selectedChat = null;
        this.messages = [];
        this.loading = false;
        this.focusMessageInput();
      },
      error: (err) => {
        console.error('Error loading chats:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudieron cargar los chats',
        });
        this.loading = false;
      },
    });
  }

  private loadMessages(chatId: number): void {
    this.loading = true;
    this.messages = [];
    this.isSending = false;
    this.studentChatService.getChatMessages(chatId).subscribe({
      next: (data) => {
        this.messages = data;
        this.loading = false;
        this.scrollToBottom();
        this.focusMessageInput();
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudieron cargar los mensajes del chat',
        });
        this.loading = false;
      },
    });
  }

  private scrollToBottom(): void {
    // Usar un timeout más largo para asegurar que el DOM se ha actualizado
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-area');
      if (messagesContainer) {
        // Usar comportamiento suave para el scroll
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 150);
  }

  private createChatAndSendMessage(): void {
    const messageToSend = this.newMessage;
    this.loading = true;


    this.studentChatService.createChat().subscribe({
      next: (data) => {

        if (!data || !data.id) {
          console.error('Chat creation response is invalid:', data);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'La respuesta del servidor no contiene un ID de chat válido',
          });
          this.loading = false;
          return;
        }

        this.selectedChat = data;
        this.messages = [];
        this.upsertChat(data);
        this.newMessage = messageToSend;

        setTimeout(() => {
          this.performSendMessage();
        }, 100);
        this.focusMessageInput();
      },
      error: (err) => {
        console.error('Error creating chat:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudo crear el chat',
        });
        this.loading = false;
      },
    });
  }

  private performSendMessage(): void {

    if (!this.selectedChat) {
      console.error('No chat selected for sending message');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay chat seleccionado',
      });
      return;
    }

    if (!this.selectedChat.id) {
      console.error('Chat ID is missing:', this.selectedChat);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El chat no tiene un ID válido',
      });
      return;
    }

    if (!this.newMessage.trim()) {
      this.focusMessageInput();
      return;
    }


    this.isSending = true;
    const content = this.newMessage;
    const chatId = this.selectedChat.id;
    this.newMessage = '';


    this.studentChatService.sendMessage(chatId, content).subscribe({
      next: (data) => {
        this.messages = [...this.messages, ...data];
        this.isSending = false;
        this.scrollToBottom();
        this.focusMessageInput();
      },
      error: (err) => {
        console.error('Error al enviar mensaje', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudo enviar el mensaje',
        });
        this.isSending = false;
        this.newMessage = content;
        this.focusMessageInput();
      },
    });
  }

  private upsertChat(chat: Chat): void {
    const existsIndex = this.chats.findIndex((item) => item.id === chat.id);
    if (existsIndex >= 0) {
      const updated = { ...this.chats[existsIndex], ...chat };
      this.chats = [updated, ...this.chats.filter((item) => item.id !== chat.id)];
    } else {
      this.chats = [chat, ...this.chats];
    }
  }

  trackByChat(_index: number, item: Chat): number {
    return item.id;
  }

  trackByMessage(_index: number, item: Message): number {
    return item.id;
  }

  private focusMessageInput(): void {
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 120);
  }

  /**
   * Abre el diálogo para editar el título del chat
   * @param chat Chat a editar
   * @param event Evento del click para evitar la propagación
   */
  openEditTitleDialog(chat: Chat, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.editingChatId = chat.id;
    this.newChatTitle = chat.title;
    this.editTitleDialogVisible = true;
  }

  /**
   * Actualiza el título del chat
   */
  updateChatTitle(): void {
    if (!this.editingChatId || !this.newChatTitle.trim()) {
      return;
    }

    this.studentChatService.updateChatTitle(this.editingChatId, this.newChatTitle.trim()).subscribe({
      next: (updatedChat) => {
        // Actualizar el chat en la lista de chats
        const chatIndex = this.chats.findIndex(chat => chat.id === this.editingChatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex].title = updatedChat.title;
          this.chats[chatIndex].updatedAt = updatedChat.updatedAt;
        }

        // Actualizar el chat seleccionado si es el que se está editando
        if (this.selectedChat && this.selectedChat.id === this.editingChatId) {
          this.selectedChat.title = updatedChat.title;
          this.selectedChat.updatedAt = updatedChat.updatedAt;
        }

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Título actualizado',
          detail: 'El título del chat ha sido actualizado correctamente.',
        });

        // Cerrar el diálogo
        this.closeEditTitleDialog();
      },
      error: (err) => {
        console.error('Error updating chat title:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudo actualizar el título del chat',
        });
      },
    });
  }

  /**
   * Cierra el diálogo de edición de título
   */
  closeEditTitleDialog(): void {
    this.editTitleDialogVisible = false;
    this.editingChatId = null;
    this.newChatTitle = '';
    
    // Enfocar el input de mensaje después de cerrar el diálogo
    this.focusMessageInput();
  }

  /**
   * Elimina un chat
   * @param chatId ID del chat a eliminar
   * @param event Evento del click para evitar la propagación
   */
  deleteChat(chatId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que deseas eliminar este chat? Esta acción no se puede deshacer.')) {
      return;
    }

    this.studentChatService.deleteChat(chatId).subscribe({
      next: () => {
        // Eliminar el chat de la lista
        this.chats = this.chats.filter(chat => chat.id !== chatId);

        // Si el chat eliminado era el seleccionado, seleccionar otro
        if (this.selectedChat?.id === chatId) {
          if (this.chats.length > 0) {
            this.selectChat(this.chats[0]);
          } else {
            this.selectedChat = null;
            this.messages = [];
            this.newMessage = '';
          }
        }

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Chat eliminado',
          detail: 'El chat ha sido eliminado correctamente.',
        });
      },
      error: (err) => {
        console.error('Error deleting chat:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudo eliminar el chat',
        });
      },
    });
  }
}
