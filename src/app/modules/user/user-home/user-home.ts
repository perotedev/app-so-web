import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {Button} from "primeng/button";
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {PaginatorState} from 'primeng/paginator';
import {ContentListModule} from '../../../shared/components/content-list/content-list.module';
import {InputSearch} from '../../../shared/components/input-search/input-search';
import {NgStyle} from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {UserForm} from '../user-form/user-form';
import {IUser} from '../../../shared/interfaces/IUser';
import {UserService} from '../user-service';
import {Loading} from '../../../shared/services/loading';
import {ToastService} from '../../../shared/services/toast';
import {IPaginationResponse} from '../../../shared/interfaces/IPaginationResponse';
import {CpfMaskPipe} from '../../../shared/pipes/cpf-mask-pipe';

@Component({
  selector: 'app-user-home',
  imports: [
    Button,
    ContentListModule,
    InputSearch,
    NgStyle,
    Dialog,
    UserForm,
    CpfMaskPipe
  ],
  templateUrl: './user-home.html',
  styleUrl: './user-home.scss',
})
export class UserHome {
  private readonly _userService: UserService = inject(UserService);
  private readonly _loading: Loading = inject(Loading);
  private readonly _toast: ToastService = inject(ToastService);
  public readonly isMobile = inject(IS_MOBILE);
  public search: WritableSignal<string> = signal('');
  public isLoadingUsers: WritableSignal<boolean> = signal(false);
  public dialogVisible: boolean = false;
  public selectedUser?: IUser;
  public total: number = 10;
  public page: number = 1;
  public size: number = 10;
  public users: WritableSignal<IUser[]> =  signal([]);

  constructor() {
    effect(() => {
      this.page = 1;
      this.size = 10;
      this.getUsers(this.page, this.size, this.search());
    });
  }

  private getUsers(page: number, size: number, search = ""): void {
    this.isLoadingUsers.set(true);
    this._userService.getUsers(page, size, search)
      .then((res: IPaginationResponse<IUser>) => {
        this.users.set(res.items);
        this.page = res.page;
        this.size = res.size;
        this.total = res.total;
      }).finally(() => this.isLoadingUsers.set(false));
  }

  private deleteUser(userId: number): void {
    this._loading.present();
    this._userService.deleteUser(userId)
      .then((res: any) => {
        this.users.set([...this.users().filter(user => user.id !== userId)]);
        this._toast.showToastSuccess("Usuário excluído com sucesso!");
      }).finally(() => this._loading.dismiss());
  }

  public removeUser(userId: number): void {
    this.deleteUser(userId);
  }

  public onPageChange(event: PaginatorState): void {
    this.page = event.page!;
    this.size = event.rows!;
    this.getUsers(this.page, this.size);
  }

  public toggleDialog(user?: IUser): void {
    this.selectedUser = user;
    this.dialogVisible = !this.dialogVisible;
  }

  public onSaveUser(user: IUser): void {
    const existingUserIndex: number = this.users().findIndex((u: IUser) => u.id === user.id);
    if (existingUserIndex >= 0) {
      this.users()[existingUserIndex] = user;
    } else {
      this.users.set([...this.users(), user]);
    }
    this.toggleDialog();
  }
}
