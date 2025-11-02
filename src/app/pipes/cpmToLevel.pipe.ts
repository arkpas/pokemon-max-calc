import { Pipe, PipeTransform } from '@angular/core';
import { POKEMON_CPMS } from '../constants/cpm.constants';

@Pipe({
  name: 'cpmToLevel',
})
export class CpmToLevelPipe implements PipeTransform {
  transform(value: number): number {
    return POKEMON_CPMS.find(cpmObj => cpmObj.value === value)?.level ?? 0;
  }
}
