import {IPerson} from './IPerson';
import {IUserConfig} from './IUserConfig';
import {IMetaData} from './IMetaData';
import {RoleEnum} from '../enums/RoleEnum';

export interface IUser extends IMetaData{
  id?: number;
  email: string;
  person: IPerson;
  person_id: number;
  active: boolean;
  role: RoleEnum;
  user_config: IUserConfig;
}
