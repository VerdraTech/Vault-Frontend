import { Injectable } from '@angular/core';
import { environment as localEnv } from '../../../environments/environment';
import { environment as sbxEnv } from '../../../environments/environment.sbx';
import { environment as prodEnv } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EnvResolverService {
  private env = this.getRuntimeEnvironment();

  constructor() { }

  getRuntimeEnvironment() {
    const host = window.location.hostname;
    console.log('RUNTIME', host)

    if (host.includes('localhost')) {
      return localEnv.apiUrl;
    } else if (host.includes('sandbox')) {
      return sbxEnv.apiUrl;
    } else {
      return prodEnv.apiUrl;
    }
  }

  get apiUrl() {
    return this.env;
  }
}
