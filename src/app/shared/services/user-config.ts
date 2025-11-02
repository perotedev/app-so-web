import {inject, Injectable} from '@angular/core';
import {CurrentUser} from './current-user';
import {HttpClient} from '@angular/common/http';
import {ThemeType} from './app-theme';
import {IUserConfig} from '../interfaces/IUserConfig';
import {environment} from '../../../environments/environment';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserConfig {
  private _currentUser: CurrentUser = inject(CurrentUser);
  private _http: HttpClient = inject(HttpClient);

  public updateUpdateTheme(theme: ThemeType, version: number = 1): void {
    const auxUser = {...this._currentUser.currentUser()};
    auxUser.user_config.theme = theme;
    this._currentUser.setUser(auxUser);
    lastValueFrom(this._http.put<IUserConfig>(
      `${environment.apiUrl}/api/v${version}/users/user-config/${auxUser.user_config.id}`,
      {theme: theme, expanded: auxUser.user_config.expanded, user_id: auxUser.id}
    )).then(res => {});
  }

  public updateUpdateMenu(expanded: boolean, version: number = 1): void {
    const auxUser = {...this._currentUser.currentUser()};
    auxUser.user_config.expanded = expanded;
    this._currentUser.setUser(auxUser);
    lastValueFrom(this._http.put<IUserConfig>(
      `${environment.apiUrl}/api/v${version}/users/user-config/${auxUser.user_config.id}`,
      {expanded: expanded, theme: auxUser.user_config.theme, user_id: auxUser.id}
    )).then(res => {});
  }
}
