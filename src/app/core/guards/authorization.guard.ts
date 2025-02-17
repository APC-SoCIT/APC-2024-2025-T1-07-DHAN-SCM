import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  UrlTree, 
  Router 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthorizationService } from '@core/services/authorization.service';
import { ResourceType, PermissionType } from '@core/models/role.model';
import { AuthService } from '@core/services/auth.service';

interface PermissionData {
  resource: ResourceType;
  type: PermissionType;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate, CanActivateChild {
  constructor(
    private authorizationService: AuthorizationService,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkPermission(route);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkPermission(route);
  }

  private checkPermission(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    console.log('[AuthorizationGuard] Checking route permissions');
    console.log('[AuthorizationGuard] Requested route:', route.url);

    // Special handling for login and logout routes
    const routePath = route.url[0]?.path;
    if (routePath === 'login' || routePath === 'logout' || routePath === 'auth/login') {
      console.log('[AuthorizationGuard] Allowing access to login/logout route');
      return of(true);
    }

    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      console.log('[AuthorizationGuard] User not authenticated, redirecting to login');
      return of(this.router.createUrlTree(['/auth/login'], {
        queryParams: { reason: 'not_authenticated' }
      }));
    }

    const requiredPermission = route.data['permission'] as PermissionData;

    // If no specific permission is required, allow access to authenticated routes
    if (!requiredPermission) {
      console.log('[AuthorizationGuard] No specific permission required, allowing access');
      return of(true);
    }

    return this.authorizationService.hasPermission(
      requiredPermission.resource, 
      requiredPermission.type
    ).pipe(
      map(hasPermission => {
        console.log(`[AuthorizationGuard] Permission check for ${requiredPermission.resource}:`, hasPermission);
        
        if (hasPermission) {
          return true;
        }
        
        console.error('[AuthorizationGuard] Access denied');
        return this.router.createUrlTree(['/unauthorized'], {
          queryParams: {
            reason: 'insufficient_permissions',
            resource: requiredPermission.resource,
            type: requiredPermission.type
          }
        });
      }),
      catchError(error => {
        console.error('[AuthorizationGuard] Permission check error:', error);
        return of(this.router.createUrlTree(['/unauthorized'], {
          queryParams: { reason: 'permission_check_error' }
        }));
      })
    );
  }
}
