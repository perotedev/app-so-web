import {Component, inject, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
import {Button} from 'primeng/button';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {IServiceOrderItem} from '../../../shared/interfaces/IServiceOrderItem';
import {StatusSeverityPipe} from '../../../shared/pipes/status-severity-pipe';
import {StatusPipe} from '../../../shared/pipes/status-pipe';

@Component({
  selector: 'app-service-order-item-card',
  imports: [
    Button,
    StatusSeverityPipe,
    StatusPipe
  ],
  templateUrl: './service-order-item-card.html',
  styleUrl: './service-order-item-card.scss'
})
export class ServiceOrderItemCard {
  public index: InputSignal<number> = input(1);
  public soItem: InputSignal<IServiceOrderItem> = input.required();
  public onlyView: InputSignal<boolean> = input(false);
  public active: InputSignal<boolean> = input(false);
  public reduced: InputSignal<boolean> = input(false);
  public onEditItem: OutputEmitterRef<void> = output();
  public onDeleteItem: OutputEmitterRef<void> = output();
  public onClickItem: OutputEmitterRef<void> = output();

  public readonly isMobile = inject(IS_MOBILE);
}
