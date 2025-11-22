import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pokemonLevelValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const level = control.value;
    const isValidLevel = level >= 1 && level <= 51 && level % 0.5 === 0;

    return isValidLevel ? null : { invalidLevel: level };
  };
}
