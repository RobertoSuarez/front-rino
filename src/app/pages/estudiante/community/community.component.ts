import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  level: number;
  experience: number;
  achievements: number;
  coursesCompleted: number;
  bio?: string;
  location?: string;
  joinDate: Date;
  isOnline: boolean;
  friendStatus: 'none' | 'pending' | 'accepted' | 'blocked';
}

interface Friend {
  id: number;
  user: User;
  friendshipDate: Date;
  mutualFriends: number;
}

interface FriendRequest {
  id: number;
  fromUser: User;
  toUser: User;
  requestDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    AvatarModule,
    BadgeModule,
    ToastModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule
  ],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CommunityComponent implements OnInit {
  activeTab: 'discover' | 'friends' = 'discover';
  showUserProfile = false;
  selectedUser: User | null = null;
  searchQuery = '';
  users: User[] = [];
  friends: Friend[] = [];
  friendRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];
  isLoading = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    console.log('CommunityComponent initialized');
    this.loadCommunityData();
  }

  private loadCommunityData() {
    this.isLoading = true;

    // Mock users data
    this.users = [
      {
        id: 1,
        username: 'cyberstudent1',
        name: 'Ana García',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        level: 15,
        experience: 2450,
        achievements: 8,
        coursesCompleted: 12,
        bio: 'Estudiante de ciberseguridad apasionada por la protección de datos.',
        location: 'Quito, Ecuador',
        joinDate: new Date('2024-01-15'),
        isOnline: true,
        friendStatus: 'none'
      },
      {
        id: 2,
        username: 'securityexpert',
        name: 'Carlos Martínez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        level: 22,
        experience: 3870,
        achievements: 15,
        coursesCompleted: 18,
        bio: 'Experto en redes y seguridad informática. ¡Compartamos conocimientos!',
        location: 'Guayaquil, Ecuador',
        joinDate: new Date('2023-11-20'),
        isOnline: false,
        friendStatus: 'none'
      },
      {
        id: 3,
        username: 'datasecure',
        name: 'María López',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        level: 18,
        experience: 3120,
        achievements: 12,
        coursesCompleted: 15,
        bio: 'Enfocada en la seguridad de datos y privacidad.',
        location: 'Cuenca, Ecuador',
        joinDate: new Date('2024-02-10'),
        isOnline: true,
        friendStatus: 'none'
      },
      {
        id: 4,
        username: 'hackermind',
        name: 'Pedro Sánchez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
        level: 25,
        experience: 4560,
        achievements: 20,
        coursesCompleted: 22,
        bio: 'Ethical hacker y profesor de ciberseguridad.',
        location: 'Quito, Ecuador',
        joinDate: new Date('2023-09-05'),
        isOnline: true,
        friendStatus: 'pending'
      },
      {
        id: 5,
        username: 'cybernovice',
        name: 'Laura Torres',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
        level: 8,
        experience: 890,
        achievements: 3,
        coursesCompleted: 5,
        bio: 'Aprendiendo sobre ciberseguridad paso a paso.',
        location: 'Loja, Ecuador',
        joinDate: new Date('2024-03-22'),
        isOnline: false,
        friendStatus: 'none'
      }
    ];

    // Mock friends data
    this.friends = [
      {
        id: 1,
        user: {
          id: 6,
          username: 'techwizard',
          name: 'Roberto Díaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
          level: 20,
          experience: 3560,
          achievements: 14,
          coursesCompleted: 16,
          bio: 'Apasionado por la tecnología y la enseñanza.',
          location: 'Quito, Ecuador',
          joinDate: new Date('2023-10-12'),
          isOnline: true,
          friendStatus: 'accepted'
        },
        friendshipDate: new Date('2024-08-15'),
        mutualFriends: 3
      },
      {
        id: 2,
        user: {
          id: 7,
          username: 'codequeen',
          name: 'Sofia Ramírez',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
          level: 19,
          experience: 3240,
          achievements: 11,
          coursesCompleted: 14,
          bio: 'Desarrolladora y entusiasta de la ciberseguridad.',
          location: 'Guayaquil, Ecuador',
          joinDate: new Date('2023-12-08'),
          isOnline: false,
          friendStatus: 'accepted'
        },
        friendshipDate: new Date('2024-09-02'),
        mutualFriends: 5
      }
    ];

    // Mock friend requests
    this.friendRequests = [
      {
        id: 1,
        fromUser: {
          id: 8,
          username: 'neuralnet',
          name: 'Diego Flores',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
          level: 16,
          experience: 2780,
          achievements: 9,
          coursesCompleted: 13,
          bio: 'Interesado en IA y ciberseguridad.',
          location: 'Quito, Ecuador',
          joinDate: new Date('2024-01-30'),
          isOnline: true,
          friendStatus: 'pending'
        },
        toUser: this.users[0], // Current user
        requestDate: new Date('2024-11-18'),
        status: 'pending',
        message: '¡Hola! Me gustaría conectarme contigo para compartir conocimientos sobre ciberseguridad.'
      }
    ];

    this.sentRequests = [
      {
        id: 2,
        fromUser: this.users[0], // Current user
        toUser: this.users[3],
        requestDate: new Date('2024-11-20'),
        status: 'pending'
      }
    ];

    this.isLoading = false;
  }

  setActiveTab(tab: 'discover' | 'friends') {
    this.activeTab = tab;
    this.searchQuery = ''; // Clear search when switching tabs
  }

  getFilteredUsers(): User[] {
    if (!this.searchQuery.trim()) {
      return this.users;
    }

    const query = this.searchQuery.toLowerCase();
    return this.users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query)
    );
  }

  getOnlineFriends(): Friend[] {
    return this.friends.filter(friend => friend.user.isOnline);
  }

  getOfflineFriends(): Friend[] {
    return this.friends.filter(friend => !friend.user.isOnline);
  }

  sendFriendRequest(user: User) {
    // Update user status
    user.friendStatus = 'pending';

    // Add to sent requests
    const request: FriendRequest = {
      id: Date.now(),
      fromUser: this.users[0], // Current user (mock)
      toUser: user,
      requestDate: new Date(),
      status: 'pending'
    };
    this.sentRequests.push(request);

    this.messageService.add({
      severity: 'success',
      summary: 'Solicitud enviada',
      detail: `Has enviado una solicitud de amistad a ${user.name}`
    });
  }

  acceptFriendRequest(request: FriendRequest) {
    request.status = 'accepted';

    // Add to friends list
    const friend: Friend = {
      id: Date.now(),
      user: request.fromUser,
      friendshipDate: new Date(),
      mutualFriends: 0
    };
    this.friends.push(friend);

    // Remove from requests
    this.friendRequests = this.friendRequests.filter(r => r.id !== request.id);

    this.messageService.add({
      severity: 'success',
      summary: 'Solicitud aceptada',
      detail: `${request.fromUser.name} ahora es tu amigo`
    });
  }

  rejectFriendRequest(request: FriendRequest) {
    request.status = 'rejected';

    // Remove from requests
    this.friendRequests = this.friendRequests.filter(r => r.id !== request.id);

    this.messageService.add({
      severity: 'info',
      summary: 'Solicitud rechazada',
      detail: `Has rechazado la solicitud de ${request.fromUser.name}`
    });
  }

  viewUserProfile(user: User) {
    this.selectedUser = user;
    this.showUserProfile = true;
  }

  closeUserProfile() {
    this.showUserProfile = false;
    this.selectedUser = null;
  }

  removeFriend(friend: Friend) {
    this.friends = this.friends.filter(f => f.id !== friend.id);

    this.messageService.add({
      severity: 'info',
      summary: 'Amigo eliminado',
      detail: `${friend.user.name} ha sido eliminado de tus amigos`
    });
  }

  getUserLevelColor(level: number): string {
    if (level >= 20) return '#f59e0b'; // Legendary - Gold
    if (level >= 15) return '#8b5cf6'; // Epic - Purple
    if (level >= 10) return '#3b82f6'; // Rare - Blue
    return '#64748b'; // Common - Gray
  }

  getUserLevelLabel(level: number): string {
    if (level >= 20) return 'Experto';
    if (level >= 15) return 'Avanzado';
    if (level >= 10) return 'Intermedio';
    return 'Principiante';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getLastSeenText(user: User): string {
    if (user.isOnline) return '';

    // Mock last seen times - in real app this would come from backend
    const lastSeenOptions = [
      'hace 5 minutos',
      'hace 30 minutos',
      'hace 1 hora',
      'hace 2 horas',
      'ayer',
      'hace 2 días'
    ];

    // Use user ID to consistently get the same "last seen" for each user
    const index = user.id % lastSeenOptions.length;
    return lastSeenOptions[index];
  }

  getFriendshipDuration(friendshipDate: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - friendshipDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `Amigos desde hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Amigos desde hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Amigos desde hace ${years} año${years > 1 ? 's' : ''}`;
    }
  }
}
