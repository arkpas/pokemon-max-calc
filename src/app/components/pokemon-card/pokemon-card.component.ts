import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DamageDetails, Type } from '../../types/types';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [CommonModule],
})
export class PokemonCardComponent {
  @Input() name!: string;
  @Input() hp!: number;
  @Input() atk!: number;
  @Input() def!: number;
  @Input() avgDamage!: number;
  @Input() avgDamagePercentage!: number;
  @Input() heal!: number;
  @Input() unhealedDamagePercentage!: number;
  @Input() imageUrl!: string;
  @Input() damageDetails: DamageDetails[] = [];
  @Input() primaryType!: Type;
  @Input() secondaryType!: Type;

  showDetails = false;

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      Fire: '#f08030',
      Water: '#6890f0',
      Electric: '#f8d030',
      Grass: '#78c850',
      Ice: '#98d8d8',
      Fighting: '#c03028',
      Poison: '#a040a0',
      Ground: '#e0c068',
      Flying: '#a890f0',
      Psychic: '#f85888',
      Bug: '#a8b820',
      Rock: '#b8a038',
      Ghost: '#705898',
      Dragon: '#7038f8',
      Dark: '#705848',
      Steel: '#b8b8d0',
      Fairy: '#ee99ac',
      Normal: '#a8a878',
    };
    return map[type] || '#cccccc'; // domyślny kolor
  }

  getTypeBadgeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getDamagePercentageColor(damagePercentage: number): string {
    switch (true) {
      case damagePercentage < 25:
        return 'green';
      case damagePercentage >= 25 && damagePercentage < 50:
        return '#007eff';
      case damagePercentage >= 50 && damagePercentage < 75:
        return '#ff8100';
      case damagePercentage >= 75 && damagePercentage < 100:
        return 'red';
      case damagePercentage >= 100:
        return 'darkred';
      default:
        return 'black';
    }
  }
}
