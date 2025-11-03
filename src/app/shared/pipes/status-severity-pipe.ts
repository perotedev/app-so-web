import { Pipe, PipeTransform } from '@angular/core';
import {ServiceOrderStatusEnum} from '../enums/ServiceOrderStatusEnum';
import {ButtonSeverity} from 'primeng/button';

@Pipe({
  name: 'statusSeverityPipe',
})
export class StatusSeverityPipe implements PipeTransform {

  transform(value: ServiceOrderStatusEnum): ButtonSeverity {
    const statusMap: Record<ServiceOrderStatusEnum, string> = {
      [ServiceOrderStatusEnum.PENDING]: 'warn',
      [ServiceOrderStatusEnum.IN_PROGRESS]: 'info',
      [ServiceOrderStatusEnum.FINISHED]: 'primary',
      [ServiceOrderStatusEnum.CANCELED]: 'danger'
    };

    return (statusMap[value] || "secondary") as ButtonSeverity;
  }

}
