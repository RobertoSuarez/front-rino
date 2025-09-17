import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: string | Date, format: string = 'dd/MM/yyyy HH:mm'): string | null {
    if (!value) {
      return null;
    }

    // Si ya es un objeto Date, simplemente usamos el DatePipe
    if (value instanceof Date) {
      return this.datePipe.transform(value, format);
    }

    // Si es un string, intentamos convertirlo
    if (typeof value === 'string') {
      // Primero intentamos con el formato ISO
      let date = new Date(value);
      
      // Si la fecha es inválida, intentamos con el formato dd/MM/yyyy HH:mm:ss
      if (isNaN(date.getTime())) {
        const parts = value.split(' ');
        if (parts.length === 2) {
          const dateParts = parts[0].split('/');
          const timeParts = parts[1].split(':');
          
          if (dateParts.length === 3 && timeParts.length >= 2) {
            try {
              const day = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10) - 1; // Los meses en JavaScript van de 0 a 11
              const year = parseInt(dateParts[2], 10);
              const hour = parseInt(timeParts[0], 10);
              const minute = parseInt(timeParts[1], 10);
              const second = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
              
              date = new Date(year, month, day, hour, minute, second);
            } catch (error) {
              console.error('Error al convertir fecha:', error);
              return value; // Devolvemos el valor original si hay un error
            }
          }
        }
      }
      
      // Si la fecha sigue siendo inválida, devolvemos el valor original
      if (isNaN(date.getTime())) {
        return value;
      }
      
      // Si la fecha es válida, la formateamos con el DatePipe
      return this.datePipe.transform(date, format);
    }
    
    return String(value);
  }
}
