import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IPaginationResponse} from '../../shared/interfaces/IPaginationResponse';
import {lastValueFrom} from 'rxjs';
import {IServiceOrder} from '../../shared/interfaces/IServiceOrder';
import {environment} from '../../../environments/environment';
import {IServiceOrderDocument} from '../../shared/interfaces/IServiceOrderDocument';
import {IServiceOrderItem} from '../../shared/interfaces/IServiceOrderItem';
import {IServiceType} from '../../shared/interfaces/IServiceType';
import {IClient} from '../../shared/interfaces/IClient';
import {IContract} from '../../shared/interfaces/IContract';
import {ServiceOrderStatusEnum} from '../../shared/enums/ServiceOrderStatusEnum';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private readonly _http: HttpClient = inject(HttpClient);

  public getServiceOrders(page: number, size: number, search: string, version: number = 1): Promise<IPaginationResponse<IServiceOrder>> {
    return lastValueFrom(this._http.get<IPaginationResponse<IServiceOrder>>(
      `${environment.apiUrl}/api/v${version}/service-orders?page=${page}&size=${size}&search=${search}`
    ));
  }

  public getServiceOrder(id: number, version: number = 1): Promise<IServiceOrder> {
    return lastValueFrom(this._http.get<IServiceOrder>(`${environment.apiUrl}/api/v${version}/service-orders/${id}`));
  }

  public createServiceOrder(serviceOrder: any, version: number = 1): Promise<IServiceOrder> {
    return lastValueFrom(this._http.post<IServiceOrder>(`${environment.apiUrl}/api/v${version}/service-orders`, serviceOrder));
  }

  public updateServiceOrder(id: number, serviceOrder: any): Promise<IServiceOrder> {
    return lastValueFrom(this._http.put<IServiceOrder>(`${environment.apiUrl}/service-order/${id}`, serviceOrder));
  }

  public deleteServiceOrder(id: number): Promise<any> {
    return lastValueFrom(this._http.delete(`${environment.apiUrl}/service-order/${id}`));
  }

  public getServiceOrderItems(id: number): Promise<IServiceOrderItem[]> {
    return lastValueFrom(this._http.get<IServiceOrderItem[]>(`${environment.apiUrl}/service-order/${id}/items`));
  }

  public getServiceDocuments(id: number): Promise<IServiceOrderDocument[]> {
    return lastValueFrom(this._http.get<IServiceOrderDocument[]>(`${environment.apiUrl}/service-order/${id}/documents`));
  }

  public getServiceTypes(page: number, size: number, search: string, version: number = 1): Promise<IPaginationResponse<IServiceType>> {
    return lastValueFrom(this._http.get<IPaginationResponse<IServiceType>>(
      `${environment.apiUrl}/api/v${version}/service-types?page=${page}&size=${size}&search=${search}`
    ));
  }

  public getClients(page: number, size: number, search: string, version: number = 1): Promise<IPaginationResponse<IClient>> {
    return lastValueFrom(this._http.get<IPaginationResponse<IClient>>(
      `${environment.apiUrl}/api/v${version}/clients?page=${page}&size=${size}&search=${search}`
    ));
  }

  public getContracts(page: number, size: number, search: string, version: number = 1): Promise<IPaginationResponse<IContract>> {
    return lastValueFrom(this._http.get<IPaginationResponse<IContract>>(
      `${environment.apiUrl}/api/v${version}/contracts?page=${page}&size=${size}&search=${search}`
    ));
  }

  public getContractsByClient(client_id: number, version: number = 1): Promise<IContract[]> {
    return lastValueFrom(this._http.get<IContract[]>(
      `${environment.apiUrl}/api/v${version}/contracts/by_client/${client_id}`
    ));
  }

  public createSoItem(soItem: any, version: number = 1): Promise<IServiceOrderItem> {
    return lastValueFrom(this._http.post<IServiceOrderItem>(`${environment.apiUrl}/api/v${version}/service-orders/item`, soItem));
  }

  public updateSoItem(id: number, soItem: any, version: number = 1): Promise<IServiceOrderItem> {
    return lastValueFrom(this._http.put<IServiceOrderItem>(`${environment.apiUrl}/api/v${version}/service-orders/item/${id}`, soItem));
  }

  public updateSoItemStatus(soItemId: number, status: ServiceOrderStatusEnum, version: number = 1): Promise<IServiceOrderItem> {
    const data = { status: status, service_order_item_id: soItemId };
    return lastValueFrom(this._http.put<IServiceOrderItem>(
      `${environment.apiUrl}/api/v${version}/service-orders/item_status/${soItemId}/status`,
      data
    ));
  }
}
