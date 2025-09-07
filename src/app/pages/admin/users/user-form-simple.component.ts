import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <p-toast></p-toast>
          
          <div class="flex align-items-center justify-content-between mb-4">
            <div>
              <h2 class="text-2xl font-bold text-900 mb-0">
                {{ isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
              </h2>
              <p class="text-600 mt-1">
                {{ isEditMode ? 'Modifica los datos del usuario' : 'Completa el formulario para crear un nuevo usuario' }}
              </p>
            </div>
            <button 
              pButton 
              pRipple 
              label="Volver" 
              icon="pi pi-arrow-left" 
              class="p-button-outlined"
              routerLink="/admin/users">
            </button>
          </div>

          <p-divider></p-divider>

          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="formgrid grid">
            <!-- Información Personal -->
            <div class="col-12">
              <h3 class="text-xl font-semibold text-900 mb-3">Información Personal</h3>
            </div>

            <div class="field col-12 md:col-6">
              <label for="firstName" class="block text-900 font-medium mb-2">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input 
                pInputText 
                id="firstName" 
                type="text" 
                formControlName="firstName"
                placeholder="Ingresa el nombre"
                class="w-full"
                [class.ng-invalid]="isFieldInvalid('firstName')" />
              <small 
                *ngIf="isFieldInvalid('firstName')" 
                class="p-error block">
                El nombre es requerido
              </small>
            </div>

            <div class="field col-12 md:col-6">
              <label for="lastName" class="block text-900 font-medium mb-2">
                Apellido <span class="text-red-500">*</span>
              </label>
              <input 
                pInputText 
                id="lastName" 
                type="text" 
                formControlName="lastName"
                placeholder="Ingresa el apellido"
                class="w-full"
                [class.ng-invalid]="isFieldInvalid('lastName')" />
              <small 
                *ngIf="isFieldInvalid('lastName')" 
                class="p-error block">
                El apellido es requerido
              </small>
            </div>

            <div class="field col-12 md:col-6">
              <label for="email" class="block text-900 font-medium mb-2">
                Correo Electrónico <span class="text-red-500">*</span>
              </label>
              <input 
                pInputText 
                id="email" 
                type="email" 
                formControlName="email"
                placeholder="usuario@ejemplo.com"
                class="w-full"
                [class.ng-invalid]="isFieldInvalid('email')" />
              <small 
                *ngIf="isFieldInvalid('email')" 
                class="p-error block">
                <span *ngIf="userForm.get('email')?.errors?.['required']">El correo electrónico es requerido</span>
                <span *ngIf="userForm.get('email')?.errors?.['email']">Ingresa un correo electrónico válido</span>
              </small>
            </div>

            <div class="field col-12 md:col-6">
              <label for="whatsApp" class="block text-900 font-medium mb-2">
                WhatsApp
              </label>
              <input 
                pInputText 
                id="whatsApp" 
                type="tel" 
                formControlName="whatsApp"
                placeholder="+57 300 123 4567"
                class="w-full" />
            </div>

            <div class="field col-12 md:col-6">
              <label for="birthday" class="block text-900 font-medium mb-2">
                Fecha de Nacimiento
              </label>
              <input 
                pInputText 
                id="birthday" 
                type="date" 
                formControlName="birthday"
                class="w-full" />
            </div>

            <!-- Información del Sistema -->
            <div class="col-12 mt-4">
              <h3 class="text-xl font-semibold text-900 mb-3">Información del Sistema</h3>
            </div>

            <div class="field col-12 md:col-6">
              <label for="typeUser" class="block text-900 font-medium mb-2">
                Tipo de Usuario <span class="text-red-500">*</span>
              </label>
              <select 
                formControlName="typeUser"
                class="w-full p-inputtext"
                [class.ng-invalid]="isFieldInvalid('typeUser')">
                <option value="">Selecciona el tipo de usuario</option>
                <option value="admin">Administrador</option>
                <option value="teacher">Profesor</option>
                <option value="student">Estudiante</option>
                <option value="parent">Padre de Familia</option>
              </select>
              <small 
                *ngIf="isFieldInvalid('typeUser')" 
                class="p-error block">
                El tipo de usuario es requerido
              </small>
            </div>

            <div class="field col-12 md:col-6">
              <label for="status" class="block text-900 font-medium mb-2">
                Estado
              </label>
              <select 
                formControlName="status"
                class="w-full p-inputtext">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <!-- Contraseña (solo para crear) -->
            <div *ngIf="!isEditMode" class="col-12 mt-4">
              <h3 class="text-xl font-semibold text-900 mb-3">Seguridad</h3>
            </div>

            <div *ngIf="!isEditMode" class="field col-12 md:col-6">
              <label for="password" class="block text-900 font-medium mb-2">
                Contraseña <span class="text-red-500">*</span>
              </label>
              <p-password 
                formControlName="password"
                [toggleMask]="true"
                placeholder="Ingresa la contraseña"
                styleClass="w-full"
                [feedback]="true"
                [class.ng-invalid]="isFieldInvalid('password')">
              </p-password>
              <small 
                *ngIf="isFieldInvalid('password')" 
                class="p-error block">
                <span *ngIf="userForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
                <span *ngIf="userForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 8 caracteres</span>
              </small>
            </div>

            <div *ngIf="!isEditMode" class="field col-12 md:col-6">
              <label for="confirmPassword" class="block text-900 font-medium mb-2">
                Confirmar Contraseña <span class="text-red-500">*</span>
              </label>
              <p-password 
                formControlName="confirmPassword"
                [toggleMask]="true"
                placeholder="Confirma la contraseña"
                styleClass="w-full"
                [feedback]="false"
                [class.ng-invalid]="isFieldInvalid('confirmPassword')">
              </p-password>
              <small 
                *ngIf="isFieldInvalid('confirmPassword')" 
                class="p-error block">
                <span *ngIf="userForm.get('confirmPassword')?.errors?.['required']">La confirmación de contraseña es requerida</span>
                <span *ngIf="userForm.get('confirmPassword')?.errors?.['passwordMismatch']">Las contraseñas no coinciden</span>
              </small>
            </div>

            <!-- Botones -->
            <div class="col-12 mt-4">
              <p-divider></p-divider>
              <div class="flex justify-content-end gap-2">
                <button 
                  pButton 
                  pRipple 
                  label="Cancelar" 
                  icon="pi pi-times" 
                  class="p-button-outlined"
                  type="button"
                  routerLink="/admin/users">
                </button>
                <button 
                  pButton 
                  pRipple 
                  [label]="isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'" 
                  [icon]="isEditMode ? 'pi pi-check' : 'pi pi-plus'" 
                  class="p-button-primary"
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
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  loadUser() {
    if (!this.userId) return;

    this.loading = true;
    const subscription = this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.data) {
          this.populateForm(response.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del usuario'
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

    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      whatsApp: user.whatsApp,
      birthday: user.birthday,
      typeUser: user.typeUser,
      status: user.status
    });
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
    // Agregar validadores de contraseña para creación
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      this.loading = false;
      return;
    }

    const formValue = this.userForm.value;
    const userData: CreateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      birthday: formValue.birthday || '',
      whatsApp: formValue.whatsApp || '',
      typeUser: formValue.typeUser,
      status: formValue.status
    };

    const subscription = this.userService.createUser(userData).subscribe({
      next: (response) => {
        if (response.statusCode === 201) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente'
          });
          this.router.navigate(['/admin/users']);
        }
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
    if (!this.userId) return;

    const formValue = this.userForm.value;
    const userData: UpdateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      birthday: formValue.birthday || undefined,
      whatsApp: formValue.whatsApp || undefined,
      typeUser: formValue.typeUser,
      status: formValue.status
    };

    const subscription = this.userService.updateUser(this.userId, userData).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario actualizado correctamente'
          });
          this.router.navigate(['/admin/users']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al actualizar el usuario'
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
