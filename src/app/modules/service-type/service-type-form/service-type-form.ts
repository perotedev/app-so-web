import {Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef} from '@angular/core';
import {IServiceType} from '../../../shared/interfaces/IServiceType';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ToastService} from '../../../shared/services/toast';
import {Loading} from '../../../shared/services/loading';
import {ServiceTypeService} from '../service-type-service';
import {markDirtyFields} from '../../../shared/utils/form-utils';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {Textarea} from 'primeng/textarea';
import {PrimeIcons} from 'primeng/api';

@Component({
  selector: 'app-service-type-form',
  imports: [
    Button,
    FloatLabel,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    Select,
    Textarea
  ],
  templateUrl: './service-type-form.html',
  styleUrl: './service-type-form.scss'
})
export class ServiceTypeForm implements OnInit {
  public editServiceType: InputSignal<IServiceType | undefined> = input<IServiceType | undefined>(undefined);
  public onSaveServiceType: OutputEmitterRef<IServiceType> = output();

  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _toast: ToastService = inject(ToastService);
  private readonly _serviceTypeService: ServiceTypeService = inject(ServiceTypeService);
  private readonly _loading: Loading = inject(Loading);
  public formServiceType: FormGroup;
  public iconOptions: { label: string; value: string }[] = [];

  constructor() {
    this.formServiceType = this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      icon: [null, [Validators.required]]
    });

    this.iconOptions = Object.keys(PrimeIcons)
      .map(key => ({
        label: key,
        value: (PrimeIcons as any)[key]
      }));
  }


  private saveServiceType(): void {
    this._loading.present();

    const req: Promise<IServiceType> =
      this.editServiceType()
        ? this._serviceTypeService.updateServiceType(this.editServiceType()!.id!, this.formServiceType.value)
        : this._serviceTypeService.createServiceType(this.formServiceType.value);

    req.then((res: IServiceType) => {
      this._toast.showToastSuccess("Tipo de serviço cadastrado com sucesso!");
      this.onSaveServiceType.emit(res);
    }).catch((err: any) => {
      this._toast.showToastError(`Erro ao ${this.editServiceType() ? 'atualizar' : 'cadastrar'} tipo de serviço!`);
    }).finally(() => this._loading.dismiss());
  }

  private patchForm(seviceType: IServiceType):void {
    this.formServiceType.patchValue({
      name: seviceType.name??"",
      description: seviceType.description??"",
      icon: seviceType.icon??""
    });
  }

  public ngOnInit(): void {
    if (this.editServiceType()) this.patchForm(this.editServiceType()!);
  }


  public onSubmit(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.formServiceType.invalid) {
      markDirtyFields(this.formServiceType, this._toast);
      return;
    }

    this.saveServiceType();
  }
}
