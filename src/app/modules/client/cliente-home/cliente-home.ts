import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {Loading} from '../../../shared/services/loading';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {IClient} from '../../../shared/interfaces/IClient';
import {IPaginationResponse} from '../../../shared/interfaces/IPaginationResponse';
import {PaginatorState} from 'primeng/paginator';
import {ToastService} from '../../../shared/services/toast';
import {ClientService} from '../client-service';
import {Button} from 'primeng/button';
import {
  ClCellDirective,
  ClCellTemplateDirective,
  ClHeaderDirective
} from '../../../shared/components/content-list/content-list-directives';
import {ContentList} from '../../../shared/components/content-list/content-list.component';
import {Dialog} from 'primeng/dialog';
import {InputSearch} from '../../../shared/components/input-search/input-search';
import {NgStyle} from '@angular/common';
import {ClienteForm} from '../cliente-form/cliente-form';
import {PhoneMaskPipe} from '../../../shared/pipes/phone-mask-pipe';
import {CnpjMaskPipe} from '../../../shared/pipes/cnpj-mask-pipe';

@Component({
  selector: 'app-cliente-home',
  imports: [
    Button,
    ClCellDirective,
    ClCellTemplateDirective,
    ClHeaderDirective,
    ContentList,
    Dialog,
    InputSearch,
    NgStyle,
    ClienteForm,
    PhoneMaskPipe,
    CnpjMaskPipe,
  ],
  templateUrl: './cliente-home.html',
  styleUrl: './cliente-home.scss'
})
export class ClienteHome {
  private readonly _clientService: ClientService = inject(ClientService);
  private readonly _loading: Loading = inject(Loading);
  private readonly _toast: ToastService = inject(ToastService);
  public readonly isMobile = inject(IS_MOBILE);
  public search: WritableSignal<string> = signal('');
  public isLoadingClients: WritableSignal<boolean> = signal(false);
  public dialogVisible: boolean = false;
  public selectedClient: WritableSignal<IClient | undefined> = signal(undefined);
  public total: number = 10;
  public page: number = 1;
  public size: number = 10;
  public clients: WritableSignal<IClient[]> = signal([]);

  constructor() {
    effect(() => {
      this.page = 1;
      this.size = 10;
      this.getClients(this.page, this.size, this.search());
    });
  }

  private getClients(page: number, size: number, search = ""): void {
    this.isLoadingClients.set(true);
    this._clientService.getClients(page, size, search)
      .then((res: IPaginationResponse<IClient>) => {
        this.clients.set(res.items);
        this.page = res.page;
        this.size = res.size;
        this.total = res.total;
      }).finally(() => this.isLoadingClients.set(false));
  }

  private deleteClient(clientId: number): void {
    this._loading.present();
    this._clientService.deleteClient(clientId)
      .then((res: any) => {
        this.clients.set([...this.clients().filter(client => client.id !== clientId)]);
        this._toast.showToastSuccess("Cliente excluído com sucesso!");
      }).finally(() => this._loading.dismiss());
  }

  public removeClient(clientId: number): void {
    this.deleteClient(clientId);
  }

  public onPageChange(event: PaginatorState): void {
    this.page = event.page! + 1;
    this.size = event.rows!;
    this.getClients(this.page, this.size);
  }

  public toggleDialog(client?: IClient): void {
    this.selectedClient.set(client);
    this.dialogVisible = !this.dialogVisible;
  }

  public onSaveClient(client: IClient): void {
    const existingClientIndex: number = this.clients().findIndex((c: IClient) => c.id === client.id);
    if (existingClientIndex >= 0) {
      const auxList: IClient[] = [...this.clients()];
      auxList[existingClientIndex] = client;
      this.clients.set(auxList);
    } else {
      this.clients.set([...this.clients(), client]);
    }
    this.toggleDialog();
  }
}
