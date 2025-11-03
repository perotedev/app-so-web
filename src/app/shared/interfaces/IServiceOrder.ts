import {ServiceOrderStatusEnum} from '../enums/ServiceOrderStatusEnum';
import {IMetaData} from './IMetaData';
import {IServiceOrderDocument} from './IServiceOrderDocument';
import {IClient} from './IClient';
import {IServiceOrderItem} from './IServiceOrderItem';

export interface IServiceOrder extends IMetaData {
  id?: number;
  client_id?: number;
  contract_id?: number;
  start_date?: Date | string;
  end_date?: Date | string;
  code: string;
  status: ServiceOrderStatusEnum;
  location: string,
  description: string;
  client: IClient,
  document_list: IServiceOrderDocument[];
  items: IServiceOrderItem[]
}
