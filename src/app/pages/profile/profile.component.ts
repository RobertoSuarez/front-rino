import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService, UserIndicators } from '../../core/services/user.service';
import { InstitutionService } from '../../core/services/institution.service';
import { Institution } from '../../core/models/institution.interface';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  birthday: string;
  whatsApp: string | null;
  urlAvatar: string;
  email: string;
  followers: number;
  score: number;
  gem: number;
  yachay: number;
  tumis: number;
  typeUser: string;  // ← AGREGADO
  institutionId?: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule,
    ToastModule,
    TooltipModule,
    RouterModule,
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileData: ProfileData | null = null;
  loading: boolean = true;
  error: string | null = null;
  editMode: boolean = false;
  profileForm: FormGroup;
  savingChanges: boolean = false;
  userId: number | null = null;
  userIndicators: UserIndicators | null = null;
  institutions: Institution[] = [];
  loadingInstitutions: boolean = false;

  get institutionsOptions(): Institution[] {
    return this.institutions || [];
  }

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private userService: UserService,
    private institutionService: InstitutionService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthday: [''],
      whatsApp: [''],
      urlAvatar: ['', Validators.required],
      institutionId: [null]
    });
  }

  ngOnInit(): void {
    this.loadProfileData();
    this.loadUserIndicators();
    this.loadInstitutions();
  }

  loadUserIndicators(): void {
    if (this.authService.isAuthenticated()) {
      this.userService.getUserIndicators().subscribe({
        next: (response) => {
          if (response && response.data) {
            this.userIndicators = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading user indicators:', error);
        }
      });
    }
  }

  loadInstitutions(): void {
    this.loadingInstitutions = true;
    this.institutions = []; // Asegurar que siempre sea un array
    
    this.institutionService.getAll().subscribe({
      next: (response: any) => {
        console.log('Respuesta de instituciones en perfil:', response);
        
        // El interceptor del backend envuelve la respuesta, así que necesitamos extraer los datos correctamente
        let institutions: Institution[] = [];
        
        if (response.data) {
          // Si response.data tiene otra propiedad data (respuesta anidada)
          if (response.data.data && Array.isArray(response.data.data)) {
            institutions = response.data.data;
          } 
          // Si response.data es directamente el array
          else if (Array.isArray(response.data)) {
            institutions = response.data;
          }
          // Si response.data es un objeto con las instituciones
          else if (typeof response.data === 'object') {
            console.warn('Estructura de respuesta inesperada:', response.data);
          }
        }
        
        this.institutions = institutions || [];
        console.log('Instituciones cargadas en perfil:', this.institutions.length);
        this.loadingInstitutions = false;
      },
      error: (error) => {
        console.error('Error loading institutions:', error);
        this.institutions = []; // Asegurar que siempre sea un array vacío en caso de error
        this.loadingInstitutions = false;
      }
    });
  }

  loadProfileData(): void {
    // Primero intentar obtener el usuario actual
    this.authService.getCurrentUser();
    
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser || !currentUser.id) {
        // Si no hay usuario, intentar cargar desde el token
        if (this.authService.isAuthenticated()) {
          // Usar un ID temporal y obtener el perfil directamente
          this.fetchProfileFromToken();
        } else {
          this.error = 'No se pudo obtener la información del usuario actual';
          this.loading = false;
        }
        return;
      }
      
      this.userId = currentUser.id;
      this.fetchProfileData(currentUser.id);
    });
  }

  fetchProfileFromToken(): void {
    // Obtener el perfil usando el token sin necesidad del ID de usuario
    this.apiService.get('auth/profile').subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.profileData = response.data;
          this.userId = response.data.id;
          this.initForm();
          // Actualizar el usuario en el servicio de autenticación
          this.authService['currentUserSubject'].next(response.data);
        } else {
          this.error = 'Error al cargar el perfil';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar la información del perfil';
        this.loading = false;
      }
    });
  }
  
  fetchProfileData(userId: number): void {
    this.apiService.get(`users/${userId}/profile`).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.profileData = response.data;
          this.initForm();
        } else {
          this.error = (response && response.message) ? response.message : 'Error al cargar el perfil';
          console.error('Error loading profile:', this.error);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar la información del perfil';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.error || 'Error desconocido'
        });
      }
    });
  }
  
  initForm(): void {
    if (this.profileData) {
      this.profileForm.patchValue({
        firstName: this.profileData.firstName,
        lastName: this.profileData.lastName,
        birthday: this.profileData.birthday,
        whatsApp: this.profileData.whatsApp || '',
        urlAvatar: this.profileData.urlAvatar,
        institutionId: this.profileData.institutionId || null
      });
    }
  }
  
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.initForm();
    }
  }
  
  saveProfile(event: Event): void {
    event.preventDefault();
    if (this.profileForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }
    
    if (!this.userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo identificar al usuario'
      });
      return;
    }
    
    this.savingChanges = true;
    const updatedData = this.profileForm.value;
  
    
    this.apiService.put(`users/profile`, updatedData).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.profileData = response.data;
          // Actualizar los datos del usuario en el servicio de autenticación
          this.authService.updateUser(response.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Perfil actualizado correctamente'
          });
          this.editMode = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: (response && response.message) ? response.message : 'Error al actualizar el perfil'
          });
        }
        this.savingChanges = false;
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error al actualizar el perfil';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
        this.savingChanges = false;
      }
    });
  }
  
  cancelEdit(): void {
    this.editMode = false;
    this.initForm();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    try {
      let date: Date;
      
      // Intentar diferentes formatos de fecha
      if (dateString.includes('/')) {
        // Formato DD/MM/YYYY HH:MM:SS o DD/MM/YYYY
        const datePart = dateString.split(' ')[0];
        const parts = datePart.split('/');
        if (parts.length === 3) {
          // Convertir DD/MM/YYYY a formato ISO (YYYY-MM-DD)
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          date = new Date(`${year}-${month}-${day}`);
        } else {
          return dateString;
        }
      } else if (dateString.includes('-')) {
        // Formato ISO (YYYY-MM-DD) o similar
        date = new Date(dateString);
      } else {
        // Intentar parsear directamente
        date = new Date(dateString);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Formatear la fecha en español
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Guayaquil'
      };
      
      return new Intl.DateTimeFormat('es-ES', options).format(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  }

  getUserTypeLabel(typeUser: string): string {
    const typeLabels: { [key: string]: string } = {
      'student': 'Estudiante',
      'teacher': 'Profesor',
      'admin': 'Administrador',
      'parent': 'Padre de Familia'
    };
    return typeLabels[typeUser] || typeUser;
  }

  getUserTypeColor(typeUser: string): string {
    const typeColors: { [key: string]: string } = {
      'student': 'success',
      'teacher': 'info',
      'admin': 'warning',
      'parent': 'help'
    };
    return typeColors[typeUser] || 'secondary';
  }
}
