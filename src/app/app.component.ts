import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormComponent } from "./components/form/form.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'pokemon-max-calc-frontend';
}
