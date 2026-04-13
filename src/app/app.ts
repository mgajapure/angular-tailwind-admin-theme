import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App implements OnInit {
  // Inject ThemeService to initialize theme on startup
  private theme = inject(ThemeService);

  ngOnInit() {
    // ThemeService constructor handles init via effect()
  }
}
