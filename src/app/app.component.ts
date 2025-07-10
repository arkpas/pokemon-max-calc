import { Component } from '@angular/core';
import { MenuComponent } from './components/menu/menu.component';
import { ResultsComponent } from './components/results/results.component';
import { BattleConfiguration } from './types/types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [MenuComponent, ResultsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'pokemon-max-calc';

  private battleConfigurationSubject = new Subject<BattleConfiguration>();
  battleConfiguration$ = this.battleConfigurationSubject.asObservable();

  pushConfiguration(battleConfiguration: BattleConfiguration) {
    this.battleConfigurationSubject.next(battleConfiguration);
  }
}
