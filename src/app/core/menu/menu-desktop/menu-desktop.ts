import {Component, computed, inject, model, ModelSignal, OnInit, Signal} from '@angular/core';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import pkg from '../../../../../package.json';
import {environment} from '../../../../environments/environment';
import {IMenuItem, MenuItem} from '../menu-item/menu-item';
import {CURRENT_USER} from '../../../shared/services/current-user';
import {Button} from 'primeng/button';
import {NavigationEnd, Router} from '@angular/router';
import {toggleMenu} from '../../../shared/utils/menu-utils';
import {RoleEnum} from '../../../shared/enums/RoleEnum';
import {UserConfig} from '../../../shared/services/user-config';
import {AppTheme} from '../../../shared/services/app-theme';

const version = pkg.version;

@Component({
  selector: 'app-menu-desktop',
  imports: [
    MenuItem,
    Button
  ],
  templateUrl: './menu-desktop.html',
  styleUrl: './menu-desktop.scss'
})
export class MenuDesktop implements OnInit{
  public expanded: ModelSignal<boolean> = model(false);

  private readonly _router = inject(Router);
  private readonly _currentUser = inject(CURRENT_USER);
  private readonly _userConfig: UserConfig = inject(UserConfig);
  private readonly _appTheme: AppTheme = inject(AppTheme);
  public readonly isMobile = inject(IS_MOBILE);
  public readonly appVersion: string = version;
  public readonly appName: string = environment.appName;
  public currentRoute: string = '';

  private readonly _menuItems: IMenuItem[] = [
    {
      label: 'Início',
      icon: 'pi pi-home',
      route: '/home',
      roles: []
    },
    {
      label: 'Ordens de Serviço',
      icon: 'pi pi-file-edit',
      route: '/service-order',
      roles: []
    },
    {
      label: 'Clientes',
      icon: 'pi pi-building',
      route: '/client',
      roles: []
    },
    {
      label: 'Contratos',
      icon: 'pi pi-briefcase',
      route: '/contract',
      roles: []
    },
    {
      label: 'Tipos de Serviços',
      icon: 'pi pi-tags',
      route: '/service-type',
      roles: []
    },
    {
      label: 'Usuários',
      icon: 'pi pi-user',
      route: '/user',
      roles: [RoleEnum.ADMIN]
      // roles: []
    }
  ]
  public menuItems: Signal<IMenuItem[]> = computed(() => {
    return this._menuItems
      .filter((item: IMenuItem) => item.roles.length === 0 || item.roles.includes(this._currentUser().role));
  });

  constructor() {
    this._router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.setCurrentRoute();
      }
    });
  }

  private setCurrentRoute(): void {
    this.currentRoute = `/${this._router.url.split('/')[0]}`;
    if (this.currentRoute === '/') this.currentRoute = `/${this._router.url.split('/')[1]}`;
  }

  public ngOnInit(): void {
    this.setCurrentRoute();
    this.expanded.set(this._currentUser().user_config.expanded)
  }

  public toggleMenuClass(): void {
    if (this.isMobile()) {
      toggleMenu();
      return;
    }

    this.expanded.set(!this.expanded());
    this._userConfig.updateUpdateMenu(this.expanded());
  }
}
