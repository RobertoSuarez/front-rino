import { Injectable } from '@angular/core';

/**
 * Servicio para reproducir audios de retroalimentación
 * Maneja la reproducción de audios de éxito y error
 */
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;

  /**
   * Reproduce un sonido de éxito
   * Se selecciona aleatoriamente entre las opciones disponibles
   */
  playSuccessSound(): void {
    // Seleccionar aleatoriamente entre los audios de éxito disponibles
    const successAudios = [
      'assets/audios/audio-well-3.wav'
    ];
    
    const randomAudio = successAudios[Math.floor(Math.random() * successAudios.length)];
    this.playAudio(randomAudio);
  }

  /**
   * Reproduce un sonido de error
   * Se selecciona aleatoriamente entre las opciones disponibles
   */
  playErrorSound(): void {
    // Seleccionar aleatoriamente entre los audios de error disponibles
    const errorAudios = [
      'assets/audios/audio-error-6.wav',
    ];
    
    const randomAudio = errorAudios[Math.floor(Math.random() * errorAudios.length)];
    this.playAudio(randomAudio);
  }

  /**
   * Reproduce un audio específico
   * @param path Ruta del archivo de audio
   */
  private playAudio(path: string): void {
    try {
      // Detener el audio anterior si está reproduciéndose
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }

      // Crear nuevo elemento de audio
      this.audioElement = new Audio(path);
      this.audioElement.volume = 0.7; // Volumen al 70%

      // Reproducir el audio
      this.audioElement.play().catch((error) => {
        console.warn(`⚠️ Error reproduciendo audio ${path}:`, error);
      });

      this.isPlaying = true;

      // Marcar como no reproduciendo cuando termina
      this.audioElement.onended = () => {
        this.isPlaying = false;
      };
    } catch (error) {
      console.error('❌ Error al reproducir audio:', error);
    }
  }

  /**
   * Detiene la reproducción actual
   */
  stopAudio(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Verifica si hay audio reproduciéndose
   */
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Ajusta el volumen del audio
   * @param volume Volumen entre 0 y 1 (0 = silencio, 1 = máximo)
   */
  setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }
}
