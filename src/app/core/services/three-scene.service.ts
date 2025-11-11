import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeSceneService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: THREE.Points[] = [];
  private animationId: number | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private container: HTMLElement | null = null;

  /**
   * Inicializa la escena 3D
   */
  initScene(container: HTMLElement): void {
    this.container = container;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff); // Fondo blanco
    this.scene.fog = new THREE.Fog(0xffffff, 100, 1000);

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 50;

    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Event listeners
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('resize', () => this.onWindowResize());

    // Iniciar animación
    this.animate();
  }

  /**
   * Crea partículas flotantes mejoradas con más efectos visuales
   */
  createFloatingParticles(count: number = 100, color: number = 0x00ff88): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    // Crear colores verdes brillantes
    const greenColor = new THREE.Color(0x00ff00);
    const brightGreenColor = new THREE.Color(0x00ff88);
    const superBrightGreen = new THREE.Color(0x00ffff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Posiciones
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      // Velocidades más rápidas
      velocities[i3] = (Math.random() - 0.5) * 1.2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 1.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 1.2;

      // Tamaños variados (más grandes)
      sizes[i] = Math.random() * 2 + 0.5;

      // Colores verdes con variación (verde puro, verde brillante, cian)
      const colorVariation = Math.random();
      if (colorVariation > 0.66) {
        superBrightGreen.toArray(colors, i3);
      } else if (colorVariation > 0.33) {
        brightGreenColor.toArray(colors, i3);
      } else {
        greenColor.toArray(colors, i3);
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0, // Opacidad máxima
      vertexColors: true,
      fog: false
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particles.push(particles);
  }

  /**
   * Crea un objeto 3D interactivo (cubo, esfera, etc.)
   */
  createInteractiveObject(
    type: 'cube' | 'sphere' | 'torus' = 'cube',
    color: number = 0x00ff88,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ): THREE.Mesh {
    let geometry: THREE.BufferGeometry;

    switch (type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(5, 32, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(5, 2, 16, 100);
        break;
      case 'cube':
      default:
        geometry = new THREE.BoxGeometry(10, 10, 10);
    }

    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);

    // Agregar luz
    if (!this.scene.getObjectByName('mainLight')) {
      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(10, 10, 10);
      light.name = 'mainLight';
      this.scene.add(light);
    }

    this.scene.add(mesh);
    return mesh;
  }

  /**
   * Crea un efecto de éxito mejorado (explosión de partículas)
   */
  createSuccessEffect(position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }): void {
    const geometry = new THREE.BufferGeometry();
    const count = 80;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const greenColor = new THREE.Color(0x00ff00);
    const yellowColor = new THREE.Color(0xffff00);
    const cyanColor = new THREE.Color(0x00ffff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;

      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI;
      const speed = Math.random() * 3 + 2;
      
      velocities[i3] = Math.cos(angle) * Math.sin(elevation) * speed;
      velocities[i3 + 1] = Math.cos(elevation) * speed + 1;
      velocities[i3 + 2] = Math.sin(angle) * Math.sin(elevation) * speed;

      sizes[i] = Math.random() * 3 + 1;

      // Colores variados (verde, amarillo, cian)
      const colorChoice = Math.random();
      if (colorChoice > 0.66) {
        yellowColor.toArray(colors, i3);
      } else if (colorChoice > 0.33) {
        cyanColor.toArray(colors, i3);
      } else {
        greenColor.toArray(colors, i3);
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0, // Opacidad máxima
      vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    // Animar y remover después de 1.5 segundos
    let elapsed = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const velAttr = particles.geometry.getAttribute('velocity') as THREE.BufferAttribute;
      const sizeAttr = particles.geometry.getAttribute('size') as THREE.BufferAttribute;

      const positions = posAttr.array as Float32Array;
      const velocities = velAttr.array as Float32Array;
      const sizes = sizeAttr.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * 0.15;
        positions[i + 1] += velocities[i + 1] * 0.15;
        positions[i + 2] += velocities[i + 2] * 0.15;
      }

      // Reducir tamaño gradualmente
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] *= 0.95;
      }

      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      (particles.material as THREE.PointsMaterial).opacity = 1 - progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(particles);
      }
    };

    animate();
  }

  /**
   * Crea un efecto de error mejorado (partículas rojas)
   */
  createErrorEffect(position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }): void {
    const geometry = new THREE.BufferGeometry();
    const count = 70;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const redColor = new THREE.Color(0xff0000);
    const orangeColor = new THREE.Color(0xff6600);
    const pinkColor = new THREE.Color(0xff0066);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = position.x + (Math.random() - 0.5) * 15;
      positions[i3 + 1] = position.y + (Math.random() - 0.5) * 15;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 15;

      // Velocidades más erráticas (efecto de explosión)
      velocities[i3] = (Math.random() - 0.5) * 2.5;
      velocities[i3 + 1] = (Math.random() - 0.5) * 2.5;
      velocities[i3 + 2] = (Math.random() - 0.5) * 2.5;

      sizes[i] = Math.random() * 2.5 + 0.8;

      // Colores variados (rojo, naranja, rosa)
      const colorChoice = Math.random();
      if (colorChoice > 0.66) {
        orangeColor.toArray(colors, i3);
      } else if (colorChoice > 0.33) {
        pinkColor.toArray(colors, i3);
      } else {
        redColor.toArray(colors, i3);
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0, // Opacidad máxima
      vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    // Animar y remover
    let elapsed = 0;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const velAttr = particles.geometry.getAttribute('velocity') as THREE.BufferAttribute;
      const sizeAttr = particles.geometry.getAttribute('size') as THREE.BufferAttribute;

      const positions = posAttr.array as Float32Array;
      const velocities = velAttr.array as Float32Array;
      const sizes = sizeAttr.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * 0.12;
        positions[i + 1] += velocities[i + 1] * 0.12;
        positions[i + 2] += velocities[i + 2] * 0.12;
      }

      // Reducir tamaño gradualmente
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] *= 0.93;
      }

      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      (particles.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(particles);
      }
    };

    animate();
  }

  /**
   * Crea una medalla 3D (gamificación)
   */
  createMedal(
    type: 'gold' | 'silver' | 'bronze' = 'gold',
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ): THREE.Mesh {
    const colors = {
      gold: 0xffd700,
      silver: 0xc0c0c0,
      bronze: 0xcd7f32
    };

    const geometry = new THREE.CylinderGeometry(3, 3, 1, 32);
    const material = new THREE.MeshPhongMaterial({
      color: colors[type],
      emissive: colors[type],
      emissiveIntensity: 0.5,
      shininess: 100
    });

    const medal = new THREE.Mesh(geometry, material);
    medal.position.set(position.x, position.y, position.z);

    // Agregar luz si no existe
    if (!this.scene.getObjectByName('medalLight')) {
      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(10, 10, 10);
      light.name = 'medalLight';
      this.scene.add(light);
    }

    this.scene.add(medal);
    return medal;
  }

  /**
   * Anima un objeto con rotación
   */
  animateObject(mesh: THREE.Mesh, duration: number = 1000): void {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
      mesh.scale.set(1 + progress * 0.2, 1 + progress * 0.2, 1 + progress * 0.2);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Maneja el movimiento del mouse
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    this.mouseX = (event.clientX - rect.left) / rect.width * 2 - 1;
    this.mouseY = -(event.clientY - rect.top) / rect.height * 2 + 1;
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  private onWindowResize(): void {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Loop de animación principal
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Actualizar partículas
    this.particles.forEach((particle) => {
      const posAttr = particle.geometry.getAttribute('position') as THREE.BufferAttribute;
      const velAttr = particle.geometry.getAttribute('velocity') as THREE.BufferAttribute;

      const positions = posAttr.array as Float32Array;
      const velocities = velAttr.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Rebote en los límites
        if (Math.abs(positions[i]) > 100) velocities[i] *= -1;
        if (Math.abs(positions[i + 1]) > 100) velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 100) velocities[i + 2] *= -1;
      }

      posAttr.needsUpdate = true;
    });

    // Aplicar efecto de mouse a objetos
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.name !== 'mainLight' && child.name !== 'medalLight') {
        child.rotation.x += this.mouseY * 0.001;
        child.rotation.y += this.mouseX * 0.001;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Limpia la escena
   */
  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.particles.forEach((particle) => {
      particle.geometry.dispose();
      (particle.material as THREE.Material).dispose();
      this.scene.remove(particle);
    });

    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });

    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }

    window.removeEventListener('mousemove', (e) => this.onMouseMove(e));
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}
