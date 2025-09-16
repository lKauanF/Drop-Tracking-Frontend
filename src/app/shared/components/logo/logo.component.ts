import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `<img [style.width.px]="size" [style.height.px]="size" src="/assets/Logo.svg" alt="Drop Tracking">`,
})
export class LogoComponent {
  @Input() size = 36; // padrão
}
