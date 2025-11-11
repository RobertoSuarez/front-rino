import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeSceneService } from '@/core/services/three-scene.service';

@Component({
  selector: 'app-three-scene',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #sceneContainer class="three-scene-container" [style.width]="width" [style.height]="height"></div>
  `,
  styles: [`
    .three-scene-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ThreeSceneComponent implements OnInit, OnDestroy {
  @ViewChild('sceneContainer') sceneContainer!: ElementRef<HTMLDivElement>;
  @Input() width: string = '100%';
  @Input() height: string = '100%';
  @Input() particleCount: number = 100;
  @Input() particleColor: number = 0x00ff88;
  @Input() enableInteractiveObject: boolean = false;
  @Input() objectType: 'cube' | 'sphere' | 'torus' = 'cube';
  @Input() objectColor: number = 0x00ff88;

  constructor(private threeService: ThreeSceneService) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.sceneContainer) {
        this.threeService.initScene(this.sceneContainer.nativeElement);
        this.threeService.createFloatingParticles(this.particleCount, this.particleColor);

        if (this.enableInteractiveObject) {
          this.threeService.createInteractiveObject(this.objectType, this.objectColor);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.threeService.dispose();
  }

  /**
   * Expone el servicio para uso externo
   */
  getThreeService(): ThreeSceneService {
    return this.threeService;
  }
}
