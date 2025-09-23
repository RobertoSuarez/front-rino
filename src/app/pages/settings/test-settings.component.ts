import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h1>Test Settings Component</h1>
      <p>Si puedes ver este mensaje, la ruta /settings está funcionando correctamente.</p>
      <p>Usuario actual: {{ userType }}</p>
    </div>
  `,
  styles: [`
    .card {
      padding: 2rem;
      margin: 2rem;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
  `]
})
export class TestSettingsComponent {
  userType = 'Desconocido';

  constructor() {
    // Intenta obtener el tipo de usuario del localStorage o sessionStorage
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.userType = userData.typeUser || 'Sin tipo';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
}
