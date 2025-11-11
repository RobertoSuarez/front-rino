import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inka-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inka-avatar-container" [ngClass]="'avatar-' + type">
      <!-- Avatar SVG - Chasqui (Mensajero Inka) -->
      <svg 
        *ngIf="type === 'chasqui'" 
        viewBox="0 0 200 200" 
        class="inka-avatar-svg"
        xmlns="http://www.w3.org/2000/svg">
        
        <!-- Cabeza -->
        <circle cx="100" cy="60" r="35" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        
        <!-- Tocado Inka (Llautu) -->
        <ellipse cx="100" cy="30" rx="45" ry="15" fill="#C41E3A" stroke="#8B0000" stroke-width="2"/>
        <rect x="75" y="25" width="50" height="8" fill="#FFD700" stroke="#DAA520" stroke-width="1"/>
        
        <!-- Ojos -->
        <circle cx="90" cy="55" r="4" fill="#000"/>
        <circle cx="110" cy="55" r="4" fill="#000"/>
        
        <!-- Sonrisa -->
        <path d="M 90 70 Q 100 75 110 70" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
        
        <!-- Cuerpo - Túnica Inka -->
        <rect x="70" y="95" width="60" height="70" rx="5" fill="#C41E3A" stroke="#8B0000" stroke-width="2"/>
        
        <!-- Decoración en la túnica (patrón inka) -->
        <line x1="85" y1="105" x2="115" y2="105" stroke="#FFD700" stroke-width="2"/>
        <line x1="85" y1="125" x2="115" y2="125" stroke="#FFD700" stroke-width="2"/>
        <line x1="85" y1="145" x2="115" y2="145" stroke="#FFD700" stroke-width="2"/>
        
        <!-- Brazos -->
        <rect x="50" y="105" width="20" height="50" rx="10" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        <rect x="130" y="105" width="20" height="50" rx="10" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        
        <!-- Manos sosteniendo Quipu (cuerda de nudos) -->
        <circle cx="45" cy="160" r="6" fill="#D4A574" stroke="#8B6F47" stroke-width="1"/>
        <circle cx="155" cy="160" r="6" fill="#D4A574" stroke="#8B6F47" stroke-width="1"/>
        
        <!-- Quipu (cuerda de registro inka) -->
        <line x1="45" y1="166" x2="45" y2="185" stroke="#8B4513" stroke-width="3"/>
        <line x1="155" y1="166" x2="155" y2="185" stroke="#8B4513" stroke-width="3"/>
        
        <!-- Nudos en el Quipu -->
        <circle cx="40" cy="175" r="3" fill="#FFD700"/>
        <circle cx="50" cy="175" r="3" fill="#FFD700"/>
        <circle cx="150" cy="175" r="3" fill="#FFD700"/>
        <circle cx="160" cy="175" r="3" fill="#FFD700"/>
        
        <!-- Piernas -->
        <rect x="85" y="165" width="12" height="35" rx="6" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        <rect x="103" y="165" width="12" height="35" rx="6" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
      </svg>

      <!-- Avatar SVG - Inca Sabio -->
      <svg 
        *ngIf="type === 'inca-sabio'" 
        viewBox="0 0 200 200" 
        class="inka-avatar-svg"
        xmlns="http://www.w3.org/2000/svg">
        
        <!-- Cabeza -->
        <circle cx="100" cy="60" r="35" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        
        <!-- Corona Inka (Mascapaicha) -->
        <path d="M 70 25 L 75 15 L 85 20 L 100 10 L 115 20 L 125 15 L 130 25 Q 100 35 70 25" 
              fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
        
        <!-- Pluma roja en la corona -->
        <line x1="100" y1="10" x2="100" y2="-5" stroke="#C41E3A" stroke-width="3"/>
        <path d="M 100 -5 Q 95 -10 100 -15 Q 105 -10 100 -5" fill="#C41E3A"/>
        
        <!-- Ojos sabios -->
        <circle cx="90" cy="55" r="5" fill="#000"/>
        <circle cx="110" cy="55" r="5" fill="#000"/>
        <circle cx="92" cy="53" r="2" fill="#FFF"/>
        <circle cx="112" cy="53" r="2" fill="#FFF"/>
        
        <!-- Barba -->
        <path d="M 85 75 Q 100 85 115 75" stroke="#8B6F47" stroke-width="2" fill="none"/>
        
        <!-- Cuerpo - Túnica dorada -->
        <rect x="70" y="95" width="60" height="70" rx="5" fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
        
        <!-- Decoración geométrica inka -->
        <rect x="80" y="105" width="40" height="8" fill="#C41E3A" stroke="#8B0000" stroke-width="1"/>
        <rect x="80" y="125" width="40" height="8" fill="#C41E3A" stroke="#8B0000" stroke-width="1"/>
        <rect x="80" y="145" width="40" height="8" fill="#C41E3A" stroke="#8B0000" stroke-width="1"/>
        
        <!-- Brazos -->
        <rect x="50" y="105" width="20" height="50" rx="10" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        <rect x="130" y="105" width="20" height="50" rx="10" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        
        <!-- Manos con bastón de mando -->
        <circle cx="45" cy="160" r="6" fill="#D4A574" stroke="#8B6F47" stroke-width="1"/>
        <circle cx="155" cy="160" r="6" fill="#D4A574" stroke="#8B6F47" stroke-width="1"/>
        
        <!-- Bastón de mando (Sunturpaucar) -->
        <line x1="45" y1="166" x2="45" y2="190" stroke="#8B4513" stroke-width="4"/>
        <circle cx="45" cy="190" r="8" fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
        
        <!-- Piernas -->
        <rect x="85" y="165" width="12" height="35" rx="6" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        <rect x="103" y="165" width="12" height="35" rx="6" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
      </svg>

      <!-- Avatar SVG - Guerrero Inka -->
      <svg 
        *ngIf="type === 'guerrero'" 
        viewBox="0 0 200 200" 
        class="inka-avatar-svg"
        xmlns="http://www.w3.org/2000/svg">
        
        <!-- Cabeza -->
        <circle cx="100" cy="60" r="35" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        
        <!-- Casco Inka (Ushnu) -->
        <path d="M 70 30 L 75 10 L 100 5 L 125 10 L 130 30 Q 100 40 70 30" 
              fill="#8B4513" stroke="#654321" stroke-width="2"/>
        <line x1="85" y1="15" x2="115" y2="15" stroke="#FFD700" stroke-width="2"/>
        
        <!-- Ojos fieros -->
        <circle cx="90" cy="55" r="5" fill="#000"/>
        <circle cx="110" cy="55" r="5" fill="#000"/>
        
        <!-- Expresión de guerrero -->
        <line x1="85" y1="70" x2="115" y2="70" stroke="#000" stroke-width="2"/>
        
        <!-- Cuerpo - Armadura -->
        <rect x="70" y="95" width="60" height="70" rx="5" fill="#696969" stroke="#2F4F4F" stroke-width="2"/>
        
        <!-- Escamas de armadura -->
        <circle cx="85" cy="110" r="4" fill="#A9A9A9" stroke="#696969" stroke-width="1"/>
        <circle cx="100" cy="110" r="4" fill="#A9A9A9" stroke="#696969" stroke-width="1"/>
        <circle cx="115" cy="110" r="4" fill="#A9A9A9" stroke="#696969" stroke-width="1"/>
        <circle cx="85" cy="130" r="4" fill="#A9A9A9" stroke="#696969" stroke-width="1"/>
        <circle cx="100" cy="130" r="4" fill="#A9A9A9" stroke="#696969" stroke-width="1"/>
        <circle cx="115" cy="130" r="4" fill="#A9A9A9" stroke="#696969" stroke-width="1"/>
        
        <!-- Brazos musculosos -->
        <rect x="50" y="105" width="20" height="50" rx="10" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        <rect x="130" y="105" width="20" height="50" rx="10" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        
        <!-- Manos con armas -->
        <circle cx="45" cy="160" r="6" fill="#D4A574" stroke="#8B6F47" stroke-width="1"/>
        <circle cx="155" cy="160" r="6" fill="#D4A574" stroke="#8B6F47" stroke-width="1"/>
        
        <!-- Lanza -->
        <line x1="45" y1="166" x2="45" y2="190" stroke="#8B4513" stroke-width="3"/>
        <polygon points="45,190 40,200 50,200" fill="#FFD700" stroke="#DAA520" stroke-width="1"/>
        
        <!-- Escudo -->
        <circle cx="155" cy="170" r="12" fill="#C41E3A" stroke="#8B0000" stroke-width="2"/>
        <circle cx="155" cy="170" r="8" fill="#FFD700" stroke="#DAA520" stroke-width="1"/>
        
        <!-- Piernas -->
        <rect x="85" y="165" width="12" height="35" rx="6" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
        <rect x="103" y="165" width="12" height="35" rx="6" fill="#D4A574" stroke="#8B6F47" stroke-width="2"/>
      </svg>
    </div>
  `,
  styles: [`
    .inka-avatar-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .inka-avatar-svg {
      width: 100%;
      height: 100%;
      max-width: 150px;
      max-height: 150px;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .avatar-chasqui .inka-avatar-svg {
      animation: float 2.5s ease-in-out infinite;
    }

    .avatar-inca-sabio .inka-avatar-svg {
      animation: float 3s ease-in-out infinite;
    }

    .avatar-guerrero .inka-avatar-svg {
      animation: float 2s ease-in-out infinite;
    }
  `]
})
export class InkaAvatarComponent {
  @Input() type: 'chasqui' | 'inca-sabio' | 'guerrero' = 'chasqui';
}
