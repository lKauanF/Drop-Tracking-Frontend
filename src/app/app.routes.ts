import { Routes } from '@angular/router';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';
// opcional: import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'entrar' },

  { path: 'entrar', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro', loadComponent: () => import('./pages/auth/cadastro/cadastro.component').then(m => m.cadastroComponent) },

   { path: 'pacientes',
    // canActivate: [authGuard],
    loadComponent: () => import('./pages/pacientes/pacientes.component').then(m => m.PacientesComponent)
  },

  { path: 'registros', loadComponent: () => import('./pages/registros/registros.component').then(m => m.RegistrosComponent) },

  { path: 'recuperar-senha', component: PlaceholderComponent, data: { titulo: 'Recuperar senha (em breve)' } },
  { path: '**', component: PlaceholderComponent, data: { titulo: 'Não encontrado' } },
];
