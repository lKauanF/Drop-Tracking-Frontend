import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface RespostaLogin {
  token: string;
  usuario?: { id: string | number; nome: string; cpf?: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private CHAVE_TOKEN = 'dt_token';

  private get estaNoNavegador() {
    return isPlatformBrowser(this.platformId);
  }

  private ENDPOINT_LOGIN = '/auth/login/';
  private ENDPOINT_CADASTRO = '/auth/registrar/';

  entrar(cpf: string, senha: string): Observable<RespostaLogin> {
    return this.api.post<RespostaLogin>(this.ENDPOINT_LOGIN, { cpf, senha })
      .pipe(tap(res => this.salvarToken(res.token)));
  }

  cadastrar(cpf: string, nome: string, senha: string) {
    return this.api.post<any>(this.ENDPOINT_CADASTRO, { cpf, nome, senha });
  }

  salvarToken(token: string) {
    if (this.estaNoNavegador) localStorage.setItem(this.CHAVE_TOKEN, token);
  }

  obterToken(): string | null {
    if (!this.estaNoNavegador) return null;          // ✅ evita erro no SSR
    return localStorage.getItem(this.CHAVE_TOKEN);
  }

  sair() {
    if (this.estaNoNavegador) localStorage.removeItem(this.CHAVE_TOKEN);
  }

  estaAutenticado(): boolean {
    return !!this.obterToken();
  }
}
