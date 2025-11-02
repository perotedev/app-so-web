import {Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef} from '@angular/core';
import {IContract} from '../../../shared/interfaces/IContract';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Loading} from '../../../shared/services/loading';
import {ToastService} from '../../../shared/services/toast';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {ContractService} from '../contract-service';
import {markDirtyFields} from '../../../shared/utils/form-utils';
import {FloatLabel} from 'primeng/floatlabel';
import {Select} from 'primeng/select';
import {DatePicker} from 'primeng/datepicker';
import {Button} from 'primeng/button';
import {IClient} from '../../../shared/interfaces/IClient';
import {Textarea} from 'primeng/textarea';
import {InputNumber} from 'primeng/inputnumber';

@Component({
  selector: 'app-contract-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    FloatLabel,
    Select,
    DatePicker,
    Button,
    Textarea,
    InputNumber
  ],
  templateUrl: './contract-form.html',
  styleUrl: './contract-form.scss'
})
export class ContractForm implements OnInit {
  public clients: InputSignal<IClient[]> = input<IClient[]>([]);
  public editContract: InputSignal<IContract | undefined> = input<IContract | undefined>(undefined);

  public onSaveContract: OutputEmitterRef<IContract> = output();
  private readonly _contractService: ContractService = inject(ContractService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _loading: Loading = inject(Loading);
  private readonly _toast: ToastService = inject(ToastService);
  public readonly isMobile = inject(IS_MOBILE);
  public formContract: FormGroup;
  public isLoadingClients: boolean = false;

  constructor() {
    this.formContract = this._formBuilder.group({
      client_id: ['', [Validators.required]],
      date_start: ['', [Validators.required]],
      date_end: ['', [Validators.required]],
      value: ['', [Validators.required]],
      description: [null]
    });
  }

  private saveContract(): void {
    this._loading.present();
    const value = this.formContract.value;
    value.date_start = new Date(value.date_start).toISOString().split('T')[0];
    value.date_end = new Date(value.date_end).toISOString().split('T')[0];

    const req: Promise<IContract> =
      this.editContract()
        ? this._contractService.updateContract(this.editContract()!.id!, value)
        : this._contractService.createContract(value);

    req.then((res: IContract) => {
      this._toast.showToastSuccess(`Contrato ${this.editContract() ? 'atualizado' : 'cadastrado'} com sucesso!`);
      this.onSaveContract.emit(res);
    }).catch((err: any) => {
      this._toast.showToastError(`Erro ao ${this.editContract() ? 'atualizar' : 'cadastrar'} contrato!`);
    }).finally(() => this._loading.dismiss());
  }

  public ngOnInit(): void {
    if (this.editContract()) {
      const start = this.editContract()!.date_start + "T00:00:00";
      const end = this.editContract()!.date_end + "T00:00:00";

      this.formContract.patchValue({
        client_id: this.editContract()!.client_id,
        date_start: new Date(start),
        date_end: new Date(end),
        value: this.editContract()!.value,
        description: this.editContract()!.description
      });
    }

    console.log(this.formContract.value);
  }

  public onSubmit(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.formContract.invalid) {
      markDirtyFields(this.formContract, this._toast);
      return;
    }

    this.saveContract();
  }

}
