import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {PaginatorState} from 'primeng/paginator';
import {ContentListModule} from '../../../shared/components/content-list/content-list.module';
import {InputSearch} from '../../../shared/components/input-search/input-search';
import {DatePipe, NgStyle} from '@angular/common';
import {ServiceOrderService} from '../service-order-service';
import {IPaginationResponse} from '../../../shared/interfaces/IPaginationResponse';
import {IServiceOrder} from '../../../shared/interfaces/IServiceOrder';
import {ToastService} from '../../../shared/services/toast';
import {Loading} from '../../../shared/services/loading';
import {StatusPipe} from '../../../shared/pipes/status-pipe';

@Component({
  selector: 'app-service-order-home',
  imports: [
    Button,
    ContentListModule,
    RouterLink,
    InputSearch,
    NgStyle,
    DatePipe,
    StatusPipe
  ],
  templateUrl: './service-order-home.html',
  styleUrl: './service-order-home.scss'
})
export class ServiceOrderHome {
  private readonly _serviceOrderService: ServiceOrderService = inject(ServiceOrderService);
  private readonly _loading: Loading = inject(Loading);
  private readonly _toast: ToastService = inject(ToastService);
  public readonly isMobile = inject(IS_MOBILE);
  public search: WritableSignal<string> = signal('');
  public isLoadingOrders: WritableSignal<boolean> = signal(false);
  public total: number = 10;
  public page: number = 1;
  public size: number = 10;
  public serviceOrders: WritableSignal<IServiceOrder[]> = signal([]);

  constructor() {
    effect(() => {
      this.page = 1;
      this.size = 10;
      this.getServiceOrders(this.page, this.size, this.search());
    });
  }

  private getServiceOrders(page: number, size: number, search = ""): void {
    this.isLoadingOrders.set(true);
    this._serviceOrderService.getServiceOrders(page, size, search)
      .then((res: IPaginationResponse<IServiceOrder>) => {
        this.serviceOrders.set(res.items);
        this.page = res.page;
        this.size = res.size;
        this.total = res.total;
      }).finally(() => this.isLoadingOrders.set(false));
  }

  private deleteServiceOrder(orderId: number): void {
    this._loading.present();
    this._serviceOrderService.deleteServiceOrder(orderId)
      .then((res: any) => {
        this.serviceOrders.set([...this.serviceOrders().filter(order => order.id !== orderId)]);
        this._toast.showToastSuccess("Ordem de serviço excluída com sucesso!");
      }).finally(() => this._loading.dismiss());
  }

  public removeServiceOrder(orderId: number): void {
    this.deleteServiceOrder(orderId);
  }

  public ngOnInit(): void {
    this.getServiceOrders(this.page, this.size);
  }

  public onPageChange(event: PaginatorState): void {
    this.page = event.page! + 1;
    this.size = event.rows!;
    this.getServiceOrders(this.page, this.size);
  }
}
