import {Component, inject, model, ModelSignal, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FileTransfer} from '../../shared/components/file-transfer/file-transfer';
import {LoadingComponent} from '../../shared/components/loading-component/loading-component';
import {IS_MOBILE} from '../../shared/services/is-mobile';
import {MenuMobile} from '../menu/menu-mobile/menu-mobile';
import {MenuDesktop} from '../menu/menu-desktop/menu-desktop';
import {HeaderBarHome} from '../header-bar/header-bar-home/header-bar-home';
import {Breadcrumb} from '../breadcrumb/breadcrumb';
import {CURRENT_USER, CurrentUser} from '../../shared/services/current-user';
import {AppTheme} from '../../shared/services/app-theme';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, FileTransfer, LoadingComponent, MenuMobile, MenuDesktop, HeaderBarHome, Breadcrumb],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private readonly _currentUser: CurrentUser = inject(CurrentUser);
  private readonly _appTheme: AppTheme = inject(AppTheme);
  public readonly isMobile = inject(IS_MOBILE);
  public readonly menuExpanded: ModelSignal<boolean> = model(true);

  public ngOnInit(): void {
    this._currentUser.initUserInHome();
    this._appTheme.setTheme(this._currentUser.currentUser().user_config.theme);
  }
}
