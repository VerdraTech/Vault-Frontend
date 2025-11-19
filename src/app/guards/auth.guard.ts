import { CanActivateFn } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.loggedIn$.pipe(
    map((isLoggedIn: any) => {
      console.log(`Auth Guard: ${isLoggedIn}`);
      return isLoggedIn;
    })
  )
};
