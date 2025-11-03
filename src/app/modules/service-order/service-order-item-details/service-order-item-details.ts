import {Component, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
import {IServiceOrderItem} from '../../../shared/interfaces/IServiceOrderItem';
import {Message} from 'primeng/message';
import {StatusPipe} from '../../../shared/pipes/status-pipe';
import {Button} from 'primeng/button';
import {StatusSeverityPipe} from '../../../shared/pipes/status-severity-pipe';
import {ServiceOrderImages} from '../service-order-images/service-order-images';

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
}
