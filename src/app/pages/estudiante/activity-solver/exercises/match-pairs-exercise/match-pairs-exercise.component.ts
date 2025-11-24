import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef, ElementRef, ViewChildren, QueryList, AfterViewInit, HostListener, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

interface ConnectionLine {
  id: string;
  path: string;
  color: string;
  pair: { left: string; right: string };
}

@Component({
  selector: 'app-match-pairs-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './match-pairs-exercise.component.html',
  styleUrl: './match-pairs-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatchPairsExerciseComponent),
      multi: true
    }
  ]
})
export class MatchPairsExerciseComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() leftOptions: string[] = [];
  @Input() rightOptions: string[] = [];
  @Input() matchedPairs: { left: string; right: string }[] = [];
  @Output() answerSubmitted = new EventEmitter<{ left: string; right: string }[]>();

  @ViewChildren('leftCard') leftCards!: QueryList<ElementRef>;
  @ViewChildren('rightCard') rightCards!: QueryList<ElementRef>;

  shuffledRightOptions: string[] = [];
  selectedLeft: string | null = null;
  selectedRight: string | null = null;
  pairs: { left: string; right: string }[] = [];
  
  // Líneas de conexión para el SVG
  connectionLines: ConnectionLine[] = [];
  colors: string[] = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', 
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
  ];

  private resizeObserver: ResizeObserver | null = null;

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef) {}

  ngOnInit() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateConnections();
    });
  }

  ngAfterViewInit() {
    // Observar cambios de tamaño en el contenedor principal
    if (this.el.nativeElement) {
      this.resizeObserver?.observe(this.el.nativeElement);
    }
    
    // Esperar un ciclo para que el DOM esté listo
    setTimeout(() => this.updateConnections(), 100);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  ngOnChanges() {
    if (this.matchedPairs && this.matchedPairs.length > 0) {
      this.pairs = [...this.matchedPairs];
    } else {
      this.pairs = [];
    }
    
    if (this.rightOptions && this.rightOptions.length > 0) {
      // Solo barajar si no se ha barajado antes o si las opciones cambiaron drásticamente
      if (this.shuffledRightOptions.length !== this.rightOptions.length) {
        this.shuffledRightOptions = this.shuffleArray([...this.rightOptions]);
      }
    }

    // Actualizar líneas cuando cambian los datos
    setTimeout(() => this.updateConnections(), 50);
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: { left: string; right: string }[]): void {
    if (value) {
      this.pairs = [...value];
      setTimeout(() => this.updateConnections(), 50);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // No necesitamos disabled state
  }

  selectLeft(item: string) {
    this.selectedLeft = this.selectedLeft === item ? null : item;
    this.tryMatch();
  }

  selectRight(item: string) {
    this.selectedRight = this.selectedRight === item ? null : item;
    this.tryMatch();
  }

  tryMatch() {
    if (this.selectedLeft && this.selectedRight) {
      // Verificar si ya existe un par con estos elementos
      const existingPairIndex = this.pairs.findIndex(
        p => p.left === this.selectedLeft || p.right === this.selectedRight
      );
      
      if (existingPairIndex > -1) {
        // Si alguno de los elementos ya estaba emparejado, eliminar ese par antiguo
        // para permitir correcciones
        this.pairs = this.pairs.filter(p => p.left !== this.selectedLeft && p.right !== this.selectedRight);
      }
      
      // Agregar nuevo par
      this.pairs.push({ left: this.selectedLeft, right: this.selectedRight });
      
      this.selectedLeft = null;
      this.selectedRight = null;
      
      this.updateConnections();
      this.onChange(this.pairs);
      this.onTouch();
      this.answerSubmitted.emit([...this.pairs]);
    }
  }

  removePair(pair: { left: string; right: string }) {
    this.pairs = this.pairs.filter(p => !(p.left === pair.left && p.right === pair.right));
    this.updateConnections();
    this.onChange(this.pairs);
    this.answerSubmitted.emit([...this.pairs]);
  }

  isLeftMatched(item: string): boolean {
    return this.pairs.some(p => p.left === item);
  }

  isRightMatched(item: string): boolean {
    return this.pairs.some(p => p.right === item);
  }

  getRightMatch(leftItem: string): string | null {
    const pair = this.pairs.find(p => p.left === leftItem);
    return pair ? pair.right : null;
  }

  getPairColor(leftItem: string): string {
    // Asignar un color consistente basado en el índice del ítem izquierdo
    const index = this.leftOptions.indexOf(leftItem);
    return this.colors[index % this.colors.length];
  }
  
  getPairColorForRight(rightItem: string): string {
    const pair = this.pairs.find(p => p.right === rightItem);
    if (pair) {
      return this.getPairColor(pair.left);
    }
    return '#10b981';
  }

  updateConnections() {
    if (!this.leftCards || !this.rightCards) return;

    this.connectionLines = [];
    const containerRect = this.el.nativeElement.querySelector('.matching-container')?.getBoundingClientRect();
    
    if (!containerRect) return;

    this.pairs.forEach((pair, index) => {
      const leftIndex = this.leftOptions.indexOf(pair.left);
      const rightIndex = this.shuffledRightOptions.indexOf(pair.right);

      if (leftIndex === -1 || rightIndex === -1) return;

      const leftEl = this.leftCards.toArray()[leftIndex].nativeElement;
      const rightEl = this.rightCards.toArray()[rightIndex].nativeElement;

      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();

      // Puntos de inicio (lado derecho de la tarjeta izquierda)
      const startX = leftRect.right - containerRect.left;
      const startY = leftRect.top + leftRect.height / 2 - containerRect.top;

      // Puntos de fin (lado izquierdo de la tarjeta derecha)
      const endX = rightRect.left - containerRect.left;
      const endY = rightRect.top + rightRect.height / 2 - containerRect.top;

      // Curva de Bezier
      const controlX1 = startX + (endX - startX) * 0.5;
      const controlY1 = startY;
      const controlX2 = endX - (endX - startX) * 0.5;
      const controlY2 = endY;

      const path = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
      
      this.connectionLines.push({
        id: `connection-${index}`,
        path: path,
        color: this.getPairColor(pair.left),
        pair: pair
      });
    });
    
    this.cdr.detectChanges();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateConnections();
  }

  private shuffleArray(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
