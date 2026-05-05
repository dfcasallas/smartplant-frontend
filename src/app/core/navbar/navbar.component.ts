import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mainLinks: NavItem[] = [
    { label: 'Inicio', path: '/inicio' },
    { label: 'Plantas', path: '/plantas' },
    { label: 'Sugerencias', path: '/sugerencias' },
    { label: 'Dudas IA', path: '/dudas-ia' },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Cuidados', path: '/cuidados' },
    { label: 'Admin', path: '/admin' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
