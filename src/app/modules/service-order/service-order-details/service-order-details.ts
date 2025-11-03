import {Component, effect, inject, input, InputSignal, signal, WritableSignal} from '@angular/core';
import {DatePipe} from "@angular/common";
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {IServiceOrder} from '../../../shared/interfaces/IServiceOrder';
import {IServiceOrderItem} from '../../../shared/interfaces/IServiceOrderItem';
import {ServiceOrderItems} from '../service-order-items/service-order-items';
import {IServiceType} from '../../../shared/interfaces/IServiceType';
import {ServiceOrderItemDetails} from '../service-order-item-details/service-order-item-details';
import {Dialog} from 'primeng/dialog';
import {ServiceOrderForm} from '../service-order-form/service-order-form';
import {ServiceOrderItemForm} from '../service-order-item-form/service-order-item-form';
import {StatusPipe} from '../../../shared/pipes/status-pipe';
import {ServiceOrderStatusEnum} from '../../../shared/enums/ServiceOrderStatusEnum';
import {Loading} from '../../../shared/services/loading';
import {ServiceOrderService} from '../service-order-service';
import {ToastService} from '../../../shared/services/toast';
import {StatusSeverityPipe} from '../../../shared/pipes/status-severity-pipe';

@Component({
  selector: 'app-service-order-details',
  imports: [
    DatePipe,
    ServiceOrderItems,
    ServiceOrderItemDetails,
    Dialog,
    ServiceOrderForm,
    ServiceOrderItemForm,
    StatusPipe,
    StatusSeverityPipe
  ],
  templateUrl: './service-order-details.html',
  styleUrl: './service-order-details.scss'
})
export class ServiceOrderDetails {
  public serviceTypes: InputSignal<IServiceType[]> = input.required();
  public serviceOrder: InputSignal<IServiceOrder | undefined> = input<IServiceOrder | undefined>(undefined);

  private readonly _loading: Loading = inject(Loading);
  private readonly _soService: ServiceOrderService = inject(ServiceOrderService);
  private readonly _toast: ToastService = inject(ToastService);
  public readonly isMobile = inject(IS_MOBILE);
  public readonly soItemList: WritableSignal<IServiceOrderItem[]> = signal([]);
  public showDialog: boolean = false;
  public showDialogItem: boolean = false;
  public currentSoItem?: IServiceOrderItem;
  public readonly serviceOrderStatusEnum = ServiceOrderStatusEnum;

  constructor() {
    effect(() => {
      if (this.serviceOrder()){
        this.soItemList.set(this.serviceOrder()!.items);
      }
    });
  }

  private updateSoItemStatus(soItemid: number, status: ServiceOrderStatusEnum): void {
    this._loading.present();
    this._soService.updateSoItemStatus(soItemid, status)
      .then((res: IServiceOrderItem)=> {
        this.onSaveItem(res, false);
        this._toast.showToastSuccess("Status atualizado com sucesso");
      }).catch((err: any) => {
        this._toast.showToastError("Erro ao atualizar status");
      }).finally(() => this._loading.dismiss());
  }

  private updateSoStatus(): void {
    const statuses = this.soItemList()
      .filter(item => item.status !== null)
      .map(item => item.status);

    if (statuses.length === 0) {
      this.serviceOrder()!.status = ServiceOrderStatusEnum.PENDING;
      return;
    }

    if (statuses.every(s => s === ServiceOrderStatusEnum.PENDING)) {
      this.serviceOrder()!.status =  ServiceOrderStatusEnum.PENDING;
      return;
    }

    if (statuses.some(s => s === ServiceOrderStatusEnum.IN_PROGRESS)) {
      this.serviceOrder()!.status =  ServiceOrderStatusEnum.IN_PROGRESS;
      return;
    }

    if (statuses.every(s => s === ServiceOrderStatusEnum.FINISHED || s === ServiceOrderStatusEnum.CANCELED)) {
      this.serviceOrder()!.status = ServiceOrderStatusEnum.FINISHED;
      return;
    }

    this.serviceOrder()!.status =  ServiceOrderStatusEnum.IN_PROGRESS;
  }

  public onSelectItem(index: number): void {
    this.currentSoItem = {...this.soItemList()[index]};

    setTimeout(() => {
      const container = document.querySelector('.content-outlet');
      if (container) {
        container.scrollTo({
          top: 670,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  public onSaveItem(item: IServiceOrderItem, toggle: boolean = true): void {
    if (toggle) this.toggleDialogItem();

    const existingItemIndex: number = this.soItemList().findIndex((i: IServiceOrderItem) => i.id === item.id);
    if (existingItemIndex >= 0) {
      this.soItemList()[existingItemIndex] = item;
    }

    if (this.currentSoItem?.id === item.id) {
      this.currentSoItem = item;
    }

    this.updateSoStatus();
  }


  public toggleDialog(): void {
    this.showDialog = !this.showDialog;
  }

  public toggleDialogItem(): void {
    this.showDialogItem = !this.showDialogItem;
  }

  public onUpdateStatus(status: ServiceOrderStatusEnum): void {
    if (this.currentSoItem) this.updateSoItemStatus(this.currentSoItem.id!, status);
  }
}
