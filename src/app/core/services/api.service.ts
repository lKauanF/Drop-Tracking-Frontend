import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  /* GET genérico */
  get<T>(url: string, params?: Record<string, any>) {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return this.http.get<T>(this.baseUrl + url, { params: httpParams });
  }

  /* POST genérico */
  post<T>(url: string, corpo: unknown) {
    return this.http.post<T>(this.baseUrl + url, corpo);
  }

  /* PUT genérico */
  put<T>(url: string, corpo: unknown) {
    return this.http.put<T>(this.baseUrl + url, corpo);
  }

  /* DELETE genérico */
  delete<T>(url: string) {
    return this.http.delete<T>(this.baseUrl + url);
  }
}
