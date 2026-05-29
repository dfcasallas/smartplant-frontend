import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
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
    { label: 'Inicio', path: '/inicio', icon: 'IN' },
    { label: 'Plantas', path: '/plantas', icon: 'PL' },
    { label: 'Sugerencias', path: '/sugerencias', icon: 'SU' },
    { label: 'Dudas IA', path: '/dudas-ia', icon: 'IA' },
    { label: 'Inventario', path: '/inventario', icon: 'IV' },
    { label: 'Cuidados', path: '/cuidados', icon: 'CU' },
    { label: 'Admin', path: '/admin', icon: 'AD', adminOnly: true },
  ];

  visibleLinks(): NavItem[] {
    return this.mainLinks.filter((item) => !item.adminOnly || this.auth.isAdmin());
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
