import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private http: HttpClient) {}

  async loadConfig() {
    try {
      // Intentamos cargar el archivo que genera Docker
      const config = await lastValueFrom(this.http.get<{apiUrl: string}>('/assets/config.json'));
      if (config && config.apiUrl) {
        environment.apiUrl = config.apiUrl;
        console.log('Modo Docker detectado. Usando API:', environment.apiUrl);
      }
    } catch (error) {
      // Si falla (error 404), significa que estamos en local (ng serve)
      // No hacemos nada y se queda con el valor de environment.ts
      console.log('Modo Local detectado. Usando URL de environment.ts:', environment.apiUrl);
    }
  }
}
