import { Component, Input } from '@angular/core';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';
import { CommonModule } from '@angular/common';
import { Type } from '../../../../types/types';

@Component({
  selector: 'app-opponent-card',
  imports: [CommonModule],
  templateUrl: './opponent-card.component.html',
  styleUrl: './opponent-card.component.scss',
})
export class OpponentCardComponent {
  @Input() name!: string;
  @Input() hp!: number;
  @Input() atk!: number;
  @Input() def!: number;
  @Input() imageUrl!: string;
  @Input() primaryType!: Type;
  @Input() secondaryType!: Type;

  showDetails = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}
