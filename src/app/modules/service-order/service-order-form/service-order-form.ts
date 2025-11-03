import {
  Component,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {FloatLabel} from 'primeng/floatlabel';
import {Select} from 'primeng/select';
import {DatePicker} from 'primeng/datepicker';
import {Textarea} from 'primeng/textarea';
import {InputText} from 'primeng/inputtext';
import {IServiceOrder} from '../../../shared/interfaces/IServiceOrder';
import {Button} from 'primeng/button';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {markDirtyFields} from '../../../shared/utils/form-utils';
import {ToastService} from '../../../shared/services/toast';
import {IClient} from '../../../shared/interfaces/IClient';
import {IContract} from '../../../shared/interfaces/IContract';
import {Loading} from '../../../shared/services/loading';
import {ServiceOrderService} from '../service-order-service';
import {ServiceOrderStatusEnum} from '../../../shared/enums/ServiceOrderStatusEnum';
import {IPaginationResponse} from '../../../shared/interfaces/IPaginationResponse';

@Component({
  selector: 'app-service-order-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FloatLabel,
    Select,
    DatePicker,
    Textarea,
    InputText,
    Button
  ],
  templateUrl: './service-order-form.html',
  styleUrl: './service-order-form.scss'
})
export class ServiceOrderForm {
  public editSO: InputSignal<IServiceOrder | undefined> = input<IServiceOrder | undefined>(undefined);
  public isDetails: InputSignal<boolean> = input(false);
  public clients: InputSignal<IClient[]> = input<IClient[]>([]);
  public onSave: OutputEmitterRef<IServiceOrder> = output();
  private readonly _toast: ToastService = inject(ToastService);

  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _serviceOrderService: ServiceOrderService = inject(ServiceOrderService);
  private readonly _loading: Loading = inject(Loading);
  public readonly isMobile = inject(IS_MOBILE);
  public readonly contracts: WritableSignal<IContract[]> = signal([]);
  public loadingContracts: boolean = false;
  public formSO: FormGroup;

  constructor() {
    this.formSO = this._formBuilder.group({
      client_id: [null, [Validators.required]],
      contract_id: [null],
      start_date: [null, [Validators.required]],
      end_date: [null],
      location: ['', [Validators.required]],
      description: ['']
    });

    effect(() => {
      if (this.editSO()) this.patchForm(this.editSO()!);
    });
  }

  private patchForm(so: IServiceOrder): void {
    this.formSO.patchValue({
      client_id: so.client_id,
      contract_id: so.contract_id??null,
      start_date: new Date(so.start_date! + "T00:00:00"),
      location: so.location??null,
      description: so.description??null,
    });

    if (so.contract_id) this.getContractsByClient(so.client_id!);
  }

  private getContractsByClient(client_id: number): void {
    this.loadingContracts = true;
    this._serviceOrderService.getContractsByClient(client_id)
      .then((res: IContract[]) => {
        this.contracts.set(res);
      }).catch(err => {
      this._toast.showToastError("Erro ao listar contratos!");
    }).finally(() => this.loadingContracts = false);
  }

  public onChangeClient(): void {
    if (this.formSO.controls['client_id'].value) {
      this.getContractsByClient(this.formSO.controls['client_id'].value);
      return;
    }

    this.contracts.set([]);
    this.formSO.controls['contract_id'].setValue(null);
  }

  private saveOs(): void {
    this._loading.present();
    const value = this.formSO.value;
    value.start_date = new Date(value.start_date).toISOString().split('T')[0];
    value.status = ServiceOrderStatusEnum.PENDING;
    const request = this.editSO()?
      this._serviceOrderService.updateServiceOrder(this.editSO()!.id!, value):
      this._serviceOrderService.createServiceOrder(value);


    request.then((res: IServiceOrder) => {
        this.onSave.emit(res);
      }).catch((err: any) => {
        this._toast.showToastError(`Erro ao ${this.editSO()?'atualizar':'criar'} ordem de serviço!`);
      }).finally(() => this._loading.dismiss());
  }

  public onSubmit(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.formSO.invalid) {
      markDirtyFields(this.formSO, this._toast)
      return
    }

    this.saveOs();
  }
}
