import {Component, inject, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {Stepper, StepperModule} from 'primeng/stepper';
import {ServiceOrderForm} from '../service-order-form/service-order-form';
import {ServiceOrderItems} from '../service-order-items/service-order-items';
import {IServiceOrder} from '../../../shared/interfaces/IServiceOrder';
import {IServiceType} from '../../../shared/interfaces/IServiceType';
import {RouterLink} from '@angular/router';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {ServiceOrderFiles} from '../service-order-files/service-order-files';
import {IPaginationResponse} from '../../../shared/interfaces/IPaginationResponse';
import {ServiceOrderService} from '../service-order-service';
import {ToastService} from '../../../shared/services/toast';
import {IClient} from '../../../shared/interfaces/IClient';

@Component({
  selector: 'app-service-order-create',
  imports: [StepperModule, ButtonModule, ServiceOrderForm, ServiceOrderItems, RouterLink, ServiceOrderFiles],
  templateUrl: './service-order-create.html',
  styleUrl: './service-order-create.scss'
})
export class ServiceOrderCreate implements OnInit{
  public readonly isMobile = inject(IS_MOBILE);
  public stepperValue: number = 1;
  @ViewChild('stepper') stepper: Stepper | undefined;

  private readonly _serviceOrderService: ServiceOrderService = inject(ServiceOrderService);
  private readonly _toast: ToastService = inject(ToastService);
  public createdSo: WritableSignal<IServiceOrder | undefined> = signal(undefined);
  public serviceTypes: WritableSignal<IServiceType[]> = signal([]);
  public clients: WritableSignal<IClient[]> = signal([]);

  private getServiceTypes(): void {
    this._serviceOrderService.getServiceTypes(1, 100, "")
      .then((res: IPaginationResponse<IServiceType>) => {
        this.serviceTypes.set(res.items);
      }).catch(err => {
      this._toast.showToastError("Erro ao listar tipos de serviço!");
    });
  }

  private getClients(): void {
    this._serviceOrderService.getClients(1, 100, "")
      .then((res: IPaginationResponse<IClient>) => {
        this.clients.set(res.items);
      }).catch(err => {
        this._toast.showToastError("Erro ao listar clientes!");
      });
  }

  public ngOnInit(): void {
    this.getServiceTypes();
    this.getClients();
  }

  public onCreate(serviceOrder: IServiceOrder): void {
    this.createdSo.set(serviceOrder);
    this.goToStep(2)
  }

  public goToStep(index: number): void {
    this.stepperValue = index;
  }
}
