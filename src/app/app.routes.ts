import { Routes } from '@angular/router';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';
import { ShellComponent } from './layout/shell/shell.component';
// import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Público
  { path: '', pathMatch: 'full', redirectTo: 'entrar' },
  { path: 'entrar', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro', loadComponent: () => import('./pages/auth/cadastro/cadastro.component').then(m => m.cadastroComponent) },

  // Área logada (Shell com rail + conteúdo)
  {
    path: '',
    component: ShellComponent,
    // canActivate: [authGuard],
    children: [
      { path: 'pacientes', loadComponent: () => import('./pages/pacientes/pacientes.component').then(m => m.PacientesComponent) },
      { path: 'registros', loadComponent: () => import('./pages/registros/registros.component').then(m => m.RegistrosComponent) },
      // { path: 'alertas', loadComponent: () => import('./pages/alertas/alertas.component').then(m => m.AlertasComponent) },
      // { path: 'config', loadComponent: () => import('./pages/config/config.component').then(m => m.ConfigComponent) },
    ]
  },

  { path: 'recuperar-senha', component: PlaceholderComponent, data: { titulo: 'Recuperar senha (em breve)' } },

  // 404
  { path: '**', component: PlaceholderComponent, data: { titulo: 'Não encontrado' } },
];
