import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-pokemon',
  imports: [MatButtonModule],
  templateUrl: './my-pokemon.component.html',
  styleUrl: './my-pokemon.component.scss',
})
export class MyPokemonComponent {
  private router = inject(Router);

  navigateToMain(): void {
    this.router.navigateByUrl('/');
  }
}
