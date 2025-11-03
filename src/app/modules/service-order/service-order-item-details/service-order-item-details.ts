import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from '@angular/core';
import {IServiceOrderItem} from '../../../shared/interfaces/IServiceOrderItem';
import {Message} from 'primeng/message';
import {StatusPipe} from '../../../shared/pipes/status-pipe';
import {Button} from 'primeng/button';
import {StatusSeverityPipe} from '../../../shared/pipes/status-severity-pipe';
import {ServiceOrderImages} from '../service-order-images/service-order-images';
import {ServiceOrderItemDocPosition} from '../../../shared/enums/ServiceOrderItemDocPosition';
import {IServiceOrderItemDocument} from '../../../shared/interfaces/IServiceOrderItemDocument';

@Component({
  selector: 'app-service-order-item-details',
  imports: [
    Message,
    StatusPipe,
    Button,
    ServiceOrderImages,
    StatusSeverityPipe
  ],
  templateUrl: './service-order-item-details.html',
  styleUrl: './service-order-item-details.scss'
})
export class ServiceOrderItemDetails {
  public soItem: InputSignal<IServiceOrderItem> = input.required();
  public onEditItem: OutputEmitterRef<void> = output();
  public onStart: OutputEmitterRef<void> = output();
  public onFinish: OutputEmitterRef<void> = output();
  public onCancel: OutputEmitterRef<void> = output();

  public readonly beforeImages: Signal<IServiceOrderItemDocument[]> = computed(() => {
    return this.soItem().documents.filter((item: IServiceOrderItemDocument) => item.position === ServiceOrderItemDocPosition.BEFORE);
  });
  public readonly afterImages: Signal<IServiceOrderItemDocument[]> = computed(() => {
    return this.soItem().documents.filter((item: IServiceOrderItemDocument) => item.position === ServiceOrderItemDocPosition.AFTER);
  });
  public readonly serviceOrderItemDocPosition = ServiceOrderItemDocPosition;
}
