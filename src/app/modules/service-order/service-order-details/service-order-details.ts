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

@Component({
  selector: 'app-service-order-details',
  imports: [
    DatePipe,
    ServiceOrderItems,
    ServiceOrderItemDetails,
    Dialog,
    ServiceOrderForm,
    ServiceOrderItemForm,
    StatusPipe
  ],
  templateUrl: './service-order-details.html',
  styleUrl: './service-order-details.scss'
})
export class ServiceOrderDetails {
  public readonly isMobile = inject(IS_MOBILE);
  public serviceTypes: InputSignal<IServiceType[]> = input.required();
  public serviceOrder: InputSignal<IServiceOrder | undefined> = input<IServiceOrder | undefined>(undefined);

  public readonly soItemList: WritableSignal<IServiceOrderItem[]> = signal([]);
  public showDialog: boolean = false;
  public showDialogItem: boolean = false;
  public currentSoItem?: IServiceOrderItem;

  constructor() {
    effect(() => {
      if (this.serviceOrder()){
        this.soItemList.set(this.serviceOrder()!.items);
      }
    });
  }

  public onSelectItem(index: number): void {
    this.currentSoItem = {...this.soItemList()[index]};
  }

  public onSaveItem(item: IServiceOrderItem): void {
    this.toggleDialogItem();

    const existingItemIndex: number = this.soItemList().findIndex((i: IServiceOrderItem) => i.id === item.id);
    if (existingItemIndex >= 0) {
      this.soItemList()[existingItemIndex] = item;
    }

    if (this.currentSoItem?.id === item.id) {
      this.currentSoItem = item;
    }
  }

  public toggleDialog(): void {
    this.showDialog = !this.showDialog;
  }

  public toggleDialogItem(): void {
    this.showDialogItem = !this.showDialogItem;
  }
}
