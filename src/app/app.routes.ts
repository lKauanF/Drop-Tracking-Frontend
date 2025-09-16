import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';

export const routes: Routes = [
  // ========= PÚBLICO (sem Shell) =========
  { path: 'entrar', loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent) },

  // Atenção ao nome da classe exportada no componente de cadastro:
  // geralmente é "CadastroComponent" (primeira maiúscula).
  { path: 'cadastro', loadComponent: () =>
      import('./pages/auth/cadastro/cadastro.component').then(m => m.cadastroComponent) },

  { path: 'recuperar-senha', component: PlaceholderComponent,
    data: { titulo: 'Recuperar senha (em breve)' } },

  // ========= ÁREA LOGADA (com Shell) =========
  {
    path: '',
    component: ShellComponent,
    // canActivate: [authGuard], // habilite quando tiver o guard
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pacientes' }, // default da área logada
      { path: 'pacientes', loadComponent: () =>
          import('./pages/pacientes/pacientes.component').then(m => m.PacientesComponent) },
      { path: 'registros', loadComponent: () =>
          import('./pages/registros/registros.component').then(m => m.RegistrosComponent) },

      // “Em breve” (opcional): use o componente reutilizável se já criou
       {
         path: 'alertas',
         loadComponent: () => import('./shared/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
         data: { title: 'Notificações', subtitle: 'Em breve…', icon: 'notifications' } },
       {
         path: 'config',
         loadComponent: () => import('./shared/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
         data: { title: 'Configurações', subtitle: 'Em breve…', icon: 'settings' } },

       { path: 'sobre', loadComponent: () => import('./pages/guia/guia.component').then(m => m.GuiaComponent) },

        { path: 'sair', loadComponent: () => import('./pages/auth/login/login.component' ).then(m => m.LoginComponent) },
    ]
  },

  // ========= 404 =========
  { path: '**', component: PlaceholderComponent, data: { titulo: 'Não encontrado' } },
];
