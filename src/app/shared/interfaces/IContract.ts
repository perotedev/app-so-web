import {IMetaData} from './IMetaData';
import {IContractDocument} from './IContractDocument';

export interface IContract extends IMetaData {
  id?: number;
  client_id?: number;
  number: string;
  date_start: Date | string;
  date_end: Date | string;
  value: number;
  description: string;
  document_list: IContractDocument[];
}
