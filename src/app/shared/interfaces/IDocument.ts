import {IMetaData} from './IMetaData';

export interface IDocument extends IMetaData{
  id?: number;
  filename: string;
  file_path: string;
  file_type: string;
  size: number;
}
