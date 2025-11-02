import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {Button} from "primeng/button";
import {
  ClCellDirective,
  ClCellTemplateDirective,
  ClHeaderDirective
} from "../../../shared/components/content-list/content-list-directives";
import {ContentList} from "../../../shared/components/content-list/content-list.component";
import {InputSearch} from "../../../shared/components/input-search/input-search";
import {IServiceType} from '../../../shared/interfaces/IServiceType';
import {Loading} from '../../../shared/services/loading';
import {ToastService} from '../../../shared/services/toast';
import {IS_MOBILE} from '../../../shared/services/is-mobile';
import {ServiceTypeService} from '../service-type-service';
import {NgStyle} from '@angular/common';
import {PaginatorState} from 'primeng/paginator';
import {IPaginationResponse} from '../../../shared/interfaces/IPaginationResponse';
import {Dialog} from 'primeng/dialog';
import {ServiceTypeForm} from '../service-type-form/service-type-form';

@Component({
  selector: 'app-service-type-home',
  imports: [
    Button,
    ClCellDirective,
    ClCellTemplateDirective,
    ClHeaderDirective,
    ContentList,
    InputSearch,
    NgStyle,
    Dialog,
    ServiceTypeForm
  ],
  templateUrl: './service-type-home.html',
  styleUrl: './service-type-home.scss'
})
export class ServiceTypeHome {
  private readonly _serviceTypeService: ServiceTypeService = inject(ServiceTypeService);
  private readonly _loading: Loading = inject(Loading);
  private readonly _toast: ToastService = inject(ToastService);
  public readonly isMobile = inject(IS_MOBILE);
  public search: WritableSignal<string> = signal("");
  public isLoadingTypes: WritableSignal<boolean> = signal(false);
  public dialogVisible: boolean = false;
  public selectedType?: IServiceType;
  public total: number = 10;
  public page: number = 1;
  public size: number = 10;
  public serviceTypes: WritableSignal<IServiceType[]> =  signal([]);

  constructor() {
    effect(() => {
      this.page = 1;
      this.size = 10;
      this.getServiceTypes(this.page, this.size, this.search());
    });
  }

  private getServiceTypes(page: number, size: number, search = ""): void {
    this.isLoadingTypes.set(true);
    this._serviceTypeService.getServiceTypes(page, size, search)
      .then((res: IPaginationResponse<IServiceType>) => {
        this.serviceTypes.set(res.items);
        this.page = res.page;
        this.size = res.size;
        this.total = res.total;
      }).finally(() => this.isLoadingTypes.set(false));
  }

  private deleteServiceType(typeId: number): void {
    this._loading.present();
    this._serviceTypeService.deleteServiceType(typeId)
      .then((res: any) => {
        this.serviceTypes.set([...this.serviceTypes().filter(type => type.id !== typeId)]);
        this._toast.showToastSuccess("Tipo de serviço excluído com sucesso!");
      }).finally(() => this._loading.dismiss());
  }

  public removeServiceTupe(userId: number): void {
    this.deleteServiceType(userId);
  }


  public onPageChange(event: PaginatorState): void {
    this.page = event.page!;
    this.size = event.rows!;
    this.getServiceTypes(this.page, this.size);
  }

  public onSaveServiceType(type: IServiceType): void {
    const existingTypeIndex: number = this.serviceTypes().findIndex((t: IServiceType) => t.id === type.id);
    if (existingTypeIndex >= 0) {
      this.serviceTypes()[existingTypeIndex] = type;
    } else {
      this.serviceTypes.set([...this.serviceTypes(), type]);
    }
    this.toggleDialog();
  }

  public toggleDialog(type?: IServiceType): void {
    this.selectedType = type;
    this.dialogVisible = !this.dialogVisible;
  }
}
