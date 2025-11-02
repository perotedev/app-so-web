import {HttpErrorResponse, HttpInterceptorFn, HttpStatusCode} from "@angular/common/http";
import {inject} from "@angular/core";
import {catchError, throwError} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from './auth-service';
import {ToastService} from '../../shared/services/toast';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const route: ActivatedRoute = inject(ActivatedRoute);
  const toast: ToastService = inject(ToastService);
  const accessToken: string = authService.getAccessToken();

  const isLoginUrl = /^\/auth(?:\/|$)/.test(req.url) || req.url.includes("/recover_password");


  const dupReq = accessToken && !isLoginUrl
    ? req.clone({
      headers: req.headers.set("Authorization", `Bearer ${accessToken}`),
    })
    : req;

  return next(dupReq).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case HttpStatusCode.Unauthorized:
          authService.logout((route.snapshot as any)._routerState.url);
          toast.showToastInfo("Sessão expirada. Faça login novamente...");
          break;

        case HttpStatusCode.InternalServerError:
          if (err.error.message) {
            toast.showToastError(err.error.message);
          } else {
            toast.showToastError("Ocorreu um erro interno");
          }
          break;

        case HttpStatusCode.BadRequest || HttpStatusCode.UnprocessableEntity:
          if (err.error.detail) {
            toast.showToastError(err.error.detail);
          }
          break;

        default:
          // if (err.error.detail) {
          //   toast.showToastError(err.error.detail);
          // }
          break;

      }

      return throwError(() => err);
    })
  );

};
