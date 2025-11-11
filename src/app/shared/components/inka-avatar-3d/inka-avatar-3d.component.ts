import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-inka-avatar-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar-3d-container">
      <div #canvas class="canvas-container"></div>
      <div class="loading-spinner" *ngIf="isLoading">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-3d-container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas-container {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #00ff88;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotateY(0deg);
      }
      50% {
        transform: translateY(-10px) rotateY(180deg);
      }
    }
  `]
})
export class InkaAvatar3dComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() type: 'chasqui' | 'inca-sabio' | 'guerrero' = 'chasqui';
  @ViewChild('canvas') canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Group;
  private animationId: number | null = null;
  private zoomLevel: number = 5;
  private minZoom: number = 3;
  private maxZoom: number = 10;
  private isDragging: boolean = false;
  private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private modelRotation: { x: number; y: number } = { x: 0, y: 0 };
  isLoading = true;

  // URLs de modelos 3D
  private modelUrls: { [key: string]: string } = {
    'chasqui': '/assets/models/inca_de_cajamarca.glb',
    'inca-sabio': '/assets/models/inca_de_cajamarca.glb',
    'guerrero': '/assets/models/inca_de_cajamarca.glb'
  };

  ngOnInit(): void {
    // Inicializar después de que la vista esté lista
  }

  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el contenedor tenga dimensiones
    setTimeout(() => {
      this.initScene();
      this.loadModel();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initScene(): void {
    const container = this.canvasContainer.nativeElement;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Asegurar que tenga dimensiones mínimas
    if (width === 0 || height === 0) {
      width = 200;
      height = 200;
      container.style.width = '100%';
      container.style.height = '100%';
    }

    // Crear escena con fondo transparente
    this.scene = new THREE.Scene();
    this.scene.background = null; // Fondo transparente

    // Crear cámara (más alejada)
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1, this.zoomLevel);
    this.camera.lookAt(0, 1, 0);

    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    
    // Limpiar contenedor antes de agregar
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Agregar luces más brillantes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Luz adicional frontal
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 5, 10);
    this.scene.add(frontLight);

    // Agregar piso
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // Manejar resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Manejar zoom con scroll
    container.addEventListener('wheel', (event: WheelEvent) => this.onMouseWheel(event), false);

    // Manejar arrastre del modelo
    container.addEventListener('mousedown', (event: MouseEvent) => this.onMouseDown(event), false);
    container.addEventListener('mousemove', (event: MouseEvent) => this.onMouseMove(event), false);
    container.addEventListener('mouseup', (event: MouseEvent) => this.onMouseUp(event), false);
    container.addEventListener('mouseleave', (event: MouseEvent) => this.onMouseUp(event), false);

    // Iniciar animación
    this.animate();
  }

  private loadModel(): void {
    const modelUrl = this.modelUrls[this.type];
    
    if (!modelUrl) {
      console.warn('⚠️ URL de modelo no encontrada para tipo:', this.type);
      this.createPlaceholder();
      this.isLoading = false;
      return;
    }

    try {
      const loader = new GLTFLoader();
      
      loader.load(
        modelUrl,
        (gltf: any) => {
          this.model = gltf.scene;
          // Escala moderada para mejor visualización
          this.model.scale.set(2.5, 2.5, 2.5);
          this.model.position.set(0, 0, 0);
          
          // Hacer que el modelo lance y reciba sombras
          this.model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              // Asegurar que el material sea visible
              if (child.material) {
                child.material.needsUpdate = true;
              }
            }
          });

          this.scene.add(this.model);
          this.isLoading = false;
          console.log('✅ Modelo cargado exitosamente:', this.type, 'desde', modelUrl);
          console.log('📦 Modelo añadido a la escena. Posición:', this.model.position);
          console.log('📦 Escala del modelo:', this.model.scale);
        },
        (progress: any) => {
          if (progress.total > 0) {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`📦 Cargando modelo: ${percent}%`);
          }
        },
        (error: any) => {
          console.error('❌ Error cargando modelo GLTF:', error);
          console.error('❌ URL intentada:', modelUrl);
          this.createPlaceholder();
          this.isLoading = false;
        }
      );
    } catch (error) {
      console.error('❌ Error en loadModel:', error);
      this.createPlaceholder();
      this.isLoading = false;
    }
  }

  private createPlaceholder(): void {
    // Crear un cubo como placeholder mientras se carga el modelo
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
    this.model = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.model.add(mesh);
    this.scene.add(this.model);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Renderizar sin animación automática (modelo estático)
    // Solo se mueve cuando el usuario arrastra

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onMouseWheel(event: WheelEvent): void {
    event.preventDefault();

    // Cambiar zoom basado en dirección del scroll
    if (event.deltaY < 0) {
      // Scroll hacia arriba = zoom in
      this.zoomLevel = Math.min(this.zoomLevel + 0.3, this.maxZoom);
    } else {
      // Scroll hacia abajo = zoom out
      this.zoomLevel = Math.max(this.zoomLevel - 0.3, this.minZoom);
    }

    // Actualizar posición de la cámara
    this.camera.position.z = this.zoomLevel;
    console.log(`🔍 Zoom: ${this.zoomLevel.toFixed(1)}x`);
  }

  private onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.model) {
      return;
    }

    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    // Sensibilidad del arrastre
    const sensitivity = 0.01;

    // Actualizar rotación del modelo
    this.modelRotation.y += deltaX * sensitivity;
    this.modelRotation.x += deltaY * sensitivity;

    // Limitar rotación en X para evitar que se voltee completamente
    this.modelRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.modelRotation.x));

    // Aplicar rotación al modelo
    this.model.rotation.order = 'YXZ';
    this.model.rotation.y = this.modelRotation.y;
    this.model.rotation.x = this.modelRotation.x;

    // Actualizar posición anterior
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
  }
}
