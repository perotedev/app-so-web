import {IDocument} from './IDocument';
import {ServiceOrderItemDocPosition} from '../enums/ServiceOrderItemDocPosition';

export interface IServiceOrderItemDocument {
  id?: number;
  service_order_item_id: number;
  document_id: number;
  document: IDocument;
  position: ServiceOrderItemDocPosition
}
