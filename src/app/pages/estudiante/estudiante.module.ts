import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    SkeletonModule,
    BadgeModule,
    CardModule
  ],
  exports: [
    TableModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    SkeletonModule,
    BadgeModule,
    CardModule
  ]
})
export class EstudianteModule { }
