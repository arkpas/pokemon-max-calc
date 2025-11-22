import { Pipe, PipeTransform } from '@angular/core';

const MAX_STATS = 15 + 15 + 15;

@Pipe({
  name: 'ivPercentage',
})
export class IvPercentagePipe implements PipeTransform {
  transform(value: number): number {
    return Math.round((value / MAX_STATS) * 100);
  }
}
