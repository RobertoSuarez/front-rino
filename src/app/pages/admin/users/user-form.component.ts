import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

import { UserService, CreateUserRequest, UpdateUserRequest } from '../../../core/services/user.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    CardModule,
    DividerModule,
    RippleModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <div class="card shadow-3">
          <p-toast></p-toast>
          
          <div class="flex justify-between w-full mb-4">
            <div>
              <h2 class="text-2xl font-bold text-900 mb-0">
                {{ isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
              </h2>
              <p class="text-600 mt-1">
                {{ isEditMode ? 'Modifica los datos del usuario' : 'Completa el formulario para crear un nuevo usuario' }}
              </p>
            </div>
            <div class="flex items-center">
              <button 
                pButton 
                pRipple 
                label="Volver" 
                icon="pi pi-arrow-left" 
                class="p-button-outlined"
                routerLink="/admin/users">
              </button>
          </div>
          </div>

          <p-divider></p-divider>

          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="w-full flex flex-col gap-4">
            <!-- Información Personal -->
            <div class="col-12">
              <h3 class="text-xl font-semibold text-900 mb-3">Información Personal</h3>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="firstName" class="block text-900 font-medium mb-2">
                Nombre <span class="text-red-500">*</span>
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-user"></i>
                <input 
                  pInputText 
                  id="firstName" 
                  type="text" 
                  formControlName="firstName"
                  placeholder="Ingresa el nombre"
                  size="large"
                  variant="outlined"
                  class="w-full"
                  [class.ng-invalid]="isFieldInvalid('firstName')" />
              </div>
              <small 
                *ngIf="isFieldInvalid('firstName')" 
                class="p-error block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>
                El nombre es requerido
              </small>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="lastName" class="block text-900 font-medium mb-2">
                Apellido <span class="text-red-500">*</span>
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-user"></i>
                <input 
                  pInputText 
                  id="lastName" 
                  type="text" 
                  formControlName="lastName"
                  placeholder="Ingresa el apellido"
                  size="large"
                  variant="outlined"
                  class="w-full"
                  [class.ng-invalid]="isFieldInvalid('lastName')" />
              </div>
              <small 
                *ngIf="isFieldInvalid('lastName')" 
                class="p-error block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>
                El apellido es requerido
              </small>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="email" class="block text-900 font-medium mb-2">
                Correo Electrónico <span class="text-red-500">*</span>
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-envelope"></i>
                <input 
                  pInputText 
                  id="email" 
                  type="email" 
                  formControlName="email"
                  placeholder="usuario@ejemplo.com"
                  size="large"
                  variant="outlined"
                  class="w-full"
                  [class.ng-invalid]="isFieldInvalid('email')" />
              </div>
              <small 
                *ngIf="isFieldInvalid('email')" 
                class="p-error block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>
                <span *ngIf="userForm.get('email')?.errors?.['required']">El correo electrónico es requerido</span>
                <span *ngIf="userForm.get('email')?.errors?.['email']">Ingresa un correo electrónico válido</span>
              </small>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="whatsApp" class="block text-900 font-medium mb-2">
                WhatsApp
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-phone"></i>
                <input 
                  pInputText 
                  id="whatsApp" 
                  type="tel" 
                  formControlName="whatsApp"
                  placeholder="+593 999 999 999"
                  size="large"
                  variant="outlined"
                  class="w-full" />
              </div>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="birthday" class="block text-900 font-medium mb-2">
                Fecha de Nacimiento
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-calendar"></i>
                <input 
                  pInputText 
                  id="birthday" 
                  type="date" 
                  formControlName="birthday"
                  size="large"
                  variant="outlined"
                  class="w-full" />
              </div>
            </div>

            <!-- Información del Sistema -->
            <div class="col-12 mt-4">
              <h3 class="text-xl font-semibold text-900 mb-3">Información del Sistema</h3>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="typeUser" class="block text-900 font-medium mb-2">
                Tipo de Usuario <span class="text-red-500">*</span>
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-users"></i>
                <select 
                  formControlName="typeUser"
                  class="w-full p-inputtext p-3"
                  [class.ng-invalid]="isFieldInvalid('typeUser')">
                  <option value="">Selecciona el tipo de usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="teacher">Profesor</option>
                  <option value="student">Estudiante</option>
                  <option value="parent">Padre de Familia</option>
                </select>
              </div>
              <small 
                *ngIf="isFieldInvalid('typeUser')" 
                class="p-error block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>
                El tipo de usuario es requerido
              </small>
            </div>

            <div class="flex flex-col field col-12 md:col-6">
              <label for="status" class="block text-900 font-medium mb-2">
                Estado
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-check-circle"></i>
                <select 
                  formControlName="status"
                  class="w-full p-inputtext p-3">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

            <!-- Contraseña (solo para crear) -->
            <div *ngIf="!isEditMode" class="col-12 mt-4">
              <h3 class="text-xl font-semibold text-900 mb-3">Seguridad</h3>
            </div>

            <div *ngIf="!isEditMode" class="flex flex-col field col-12 md:col-6">
              <label for="password" class="block text-900 font-medium mb-2">
                Contraseña <span class="text-red-500">*</span>
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-lock"></i>
                <p-password 
                  formControlName="password"
                  [toggleMask]="true"
                  class="w-full"
                  placeholder="Ingresa la contraseña"
                  [fluid]="true"
                  inputStyleClass="pl-5"
                  [feedback]="true"
                  [class.ng-invalid]="isFieldInvalid('password')">
                  <ng-template pTemplate="header">
                    <h6 class="font-bold mb-2">Seguridad de la contraseña</h6>
                  </ng-template>
                  <ng-template pTemplate="footer">
                    <p-divider></p-divider>
                    <p class="mt-2 font-medium">Sugerencias:</p>
                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                      <li>Al menos una minúscula</li>
                      <li>Al menos una mayúscula</li>
                      <li>Al menos un número</li>
                      <li>Mínimo 8 caracteres</li>
                    </ul>
                  </ng-template>
                </p-password>
              </div>
              <small 
                *ngIf="isFieldInvalid('password')" 
                class="p-error block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>
                <span *ngIf="userForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
                <span *ngIf="userForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 8 caracteres</span>
              </small>
            </div>

            <div *ngIf="!isEditMode" class="flex flex-col field col-12 md:col-6">
              <label for="confirmPassword" class="block text-900 font-medium mb-2">
                Confirmar Contraseña <span class="text-red-500">*</span>
              </label>
              <div class="w-full flex flex-row items-center gap-4">
                <i class="pi pi-shield"></i>
                <p-password 
                  formControlName="confirmPassword"
                  [toggleMask]="true"
                  class="w-full"
                  placeholder="Confirma la contraseña"
                  fluid
                  inputStyleClass="pl-5"
                  [feedback]="false"
                  [class.ng-invalid]="isFieldInvalid('confirmPassword')">
                </p-password>
              </div>
              <small 
                *ngIf="isFieldInvalid('confirmPassword')" 
                class="p-error block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>
                <span *ngIf="userForm.get('confirmPassword')?.errors?.['required']">La confirmación de contraseña es requerida</span>
                <span *ngIf="userForm.get('confirmPassword')?.errors?.['passwordMismatch']">Las contraseñas no coinciden</span>
              </small>
            </div>

            <!-- Botones -->
            <div class="col-12 mt-5">
              <p-divider></p-divider>
              <div class="flex justify-content-end gap-3 mt-4">
                <button 
                  pButton 
                  pRipple 
                  label="Cancelar" 
                  icon="pi pi-times" 
                  class="p-button-outlined p-button-lg"
                  type="button"
                  routerLink="/admin/users">
                </button>
                <button 
                  pButton 
                  pRipple 
                  [label]="isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'" 
                  [icon]="isEditMode ? 'pi pi-check' : 'pi pi-plus'" 
                  class="p-button-primary p-button-lg"
                  type="submit"
                  [loading]="loading"
                  [disabled]="userForm.invalid">
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserFormComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isEditMode = false;
  loading = false;
  userId: number | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUser();
      } else {
        // Si estamos creando un usuario, configuramos validadores de contraseña
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      whatsApp: [''],
      birthday: [''],
      typeUser: ['', [Validators.required]],
      status: ['active'],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value && confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }

  loadUser() {
    if (!this.userId) return;

    this.loading = true;
    
    // Primero, aseguramos que el formulario esté inicializado correctamente
    this.userForm = this.createForm();
    
    const subscription = this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response && response.data) {
          
          // Forzar un pequeño retraso para asegurar que el formulario esté listo
          setTimeout(() => {
            this.populateForm(response.data.data);
            
            // Verificar que los datos se hayan establecido correctamente
            
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Datos del usuario cargados correctamente'
            });
            
            this.loading = false;
          }, 100);
        } else {
          console.error('No se recibieron datos del usuario');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos del usuario'
          });
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del usuario: ' + (error.error?.message || error.message || 'Error desconocido')
        });
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  populateForm(user: User) {
    
    // Remover validadores de contraseña en modo edición
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    // Formatear la fecha de nacimiento para el input de tipo date
    let formattedBirthday = '';
    if (user.birthday) {
      try {
        // Intentar diferentes formatos de fecha
        let date;
        if (typeof user.birthday === 'string') {
          // Si es una cadena ISO o formato de fecha estándar
          if (user.birthday.includes('T')) {
            date = new Date(user.birthday);
          } else if (user.birthday.includes('/')) {
            // Formato dd/MM/yyyy
            const parts = user.birthday.split('/');
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          } else {
            date = new Date(user.birthday);
          }
        } else {
          // Si es un objeto Date o timestamp
          date = new Date(user.birthday);
        }
        
        // Verificar si la fecha es válida
        if (!isNaN(date.getTime())) {
          formattedBirthday = date.toISOString().split('T')[0];
        } else {
          console.error('Fecha inválida:', user.birthday);
        }
      } catch (error) {
        console.error('Error al formatear la fecha:', error);
      }
    }

    // Asegurarse de que todos los campos tengan valores válidos
    const formValues = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      whatsApp: user.whatsApp || '',
      birthday: formattedBirthday,
      typeUser: user.typeUser || '',
      status: user.status || 'active'
    };
    
    
    // Actualizar el formulario
    this.userForm.patchValue(formValues);
    
    // Verificar que los valores se hayan cargado correctamente
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    const formValue = this.userForm.value;
    
    // Formatear la fecha de nacimiento para el backend
    let formattedBirthday = '';
    if (formValue.birthday) {
      const date = new Date(formValue.birthday);
      formattedBirthday = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    
    const userData: CreateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      birthday: formattedBirthday,
      whatsApp: formValue.whatsApp || '',
      typeUser: formValue.typeUser,
      status: formValue.status
    };

    const subscription = this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente'
        });
        this.router.navigate(['/admin/users']);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al crear el usuario'
        });
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  updateUser() {
    if (!this.userId) {
      console.error('No se puede actualizar el usuario: ID no disponible');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede actualizar el usuario: ID no disponible'
      });
      this.loading = false;
      return;
    }

    const formValue = this.userForm.value;
    
    // Formatear la fecha de nacimiento para el backend
    let formattedBirthday = '';
    if (formValue.birthday) {
      try {
        const date = new Date(formValue.birthday);
        if (!isNaN(date.getTime())) {
          formattedBirthday = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        } else {
          console.warn('Fecha inválida, no se enviará al backend');
        }
      } catch (error) {
        console.error('Error al formatear la fecha:', error);
      }
    }
    
    // Preparar los datos para enviar al backend
    const userData: UpdateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email, // Incluir email si es necesario para la actualización
      birthday: formattedBirthday || undefined,
      whatsApp: formValue.whatsApp || '',
      typeUser: formValue.typeUser,
      status: formValue.status
    };
    

    const subscription = this.userService.updateUser(this.userId, userData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado correctamente'
        });
        this.router.navigate(['/admin/users']);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el usuario: ' + (error.error?.message || error.message || 'Error desconocido')
        });
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }
}
