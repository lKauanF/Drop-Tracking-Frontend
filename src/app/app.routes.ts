import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';

/**
 * Mapa de rotas da aplicação.
 *
 * Convenções usadas:
 * - Rotas públicas (sem Shell) no topo.
 * - Rotas autenticadas (com Shell) agrupadas em `children`.
 * - `loadComponent` sempre lazy (code-splitting).
 * - `data.title` para títulos de páginas quando útil.
 * - Comentários com dicas para futuros guards/resolvers.
 */
export const routes: Routes = [
  // ========= ROTAS PÚBLICAS (fora do Shell) =========

  {
    path: 'entrar',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Entrar' },
  },

  {
    path: 'cadastro',
    loadComponent: () =>
      import('./pages/auth/cadastro/cadastro.component').then(m => m.CadastroComponent),
    data: { title: 'Cadastro' },
  },

  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./pages/auth/recuperar-senha/recuperar-senha.component').then(m => m.RecuperarSenhaComponent),
    data: { title: 'Recuperar Senha' },
  },

  // ========= ÁREA LOGADA (dentro do Shell/Layout) =========
  {
    path: '',
    component: ShellComponent,
    // canActivate: [authGuard], // Habilite quando tiver um guard de autenticação
    // canActivateChild: [authGuard], // (opcional) protege também as rotas filhas
    children: [
      // Default da área logada → redireciona para "pacientes"
      { path: '', pathMatch: 'full', redirectTo: 'pacientes' },

      {
        path: 'pacientes',
        loadComponent: () =>
          import('./pages/pacientes/pacientes.component').then(m => m.PacientesComponent),
        data: { title: 'Pacientes' },
      },

      {
        path: 'registros',
        loadComponent: () =>
          import('./pages/registros/registros.component').then(m => m.RegistrosComponent),
        data: { title: 'Registros' },
      },

    

      // Páginas “Em breve” reutilizando um componente genérico
      {
        path: 'alertas',
        loadComponent: () =>
          import('./pages/estatisticas-ia/estatisticas-ia.component').then(m => m.EstatisticasIaComponent),
        data: { title: 'Estatísticas (IA)' },
      },

      {
        path: 'config',
        loadComponent: () =>
          import('./shared/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
        data: { title: 'Configurações', subtitle: 'Em breve…', icon: 'settings' },
      },

      {
        path: 'sobre',
        loadComponent: () =>
          import('./pages/guia/guia.component').then(m => m.GuiaComponent),
        data: { title: 'Guia do Usuário' },
      },

      // “Sair” pode só redirecionar para login; se preferir, trate no guard/interceptor
      {
        path: 'sair',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(m => m.LoginComponent),
        data: { title: 'Sair' },
      },
    ],
  },

  // ========= 404 (sempre por último) =========
  {
    path: '**',
    component: PlaceholderComponent,
    data: { titulo: 'Não encontrado' },
  },
];
