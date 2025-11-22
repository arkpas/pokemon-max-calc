import { Component } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { ResultsComponent } from './results/results.component';
import { BattleConfiguration } from '../../types/types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [MenuComponent, ResultsComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  title = 'pokemon-max-calc';

  private battleConfigurationSubject = new Subject<BattleConfiguration>();
  battleConfiguration$ = this.battleConfigurationSubject.asObservable();

  pushConfiguration(battleConfiguration: BattleConfiguration) {
    this.battleConfigurationSubject.next(battleConfiguration);
  }
}
