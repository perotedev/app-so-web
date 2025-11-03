import {ServiceOrderStatusEnum} from '../enums/ServiceOrderStatusEnum';
import {IServiceOrderItemDocument} from './IServiceOrderItemDocument';
import {IServiceType} from './IServiceType';

export interface IServiceOrderItem {
  id?: number;
  service_order_id: number;
  service_type_id: number;
  description: string;
  notes: string;
  status: ServiceOrderStatusEnum;
  documents: IServiceOrderItemDocument[];
  service_type: IServiceType;
}
