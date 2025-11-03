import {Component, effect, inject, input, InputSignal, model, ModelSignal, signal, WritableSignal} from '@angular/core';
import {FileTransferService} from '../../../shared/services/file-transfer';
import {IServiceOrderItemDocument} from '../../../shared/interfaces/IServiceOrderItemDocument';
import {takeUntil} from 'rxjs';
import {ToastService} from '../../../shared/services/toast';
import {ServiceOrderItemDocPosition} from '../../../shared/enums/ServiceOrderItemDocPosition';
import {environment} from '../../../../environments/environment';
import {GalleriaModule} from 'primeng/galleria';
import {IFileTransfer} from '../../../shared/interfaces/IFileTransfer';

@Component({
  selector: 'app-service-order-images',
  imports: [
    GalleriaModule
  ],
  templateUrl: './service-order-images.html',
  styleUrl: './service-order-images.scss'
})
export class ServiceOrderImages {
  public soItemId: InputSignal<number> = input.required();
  public photoList: ModelSignal<IServiceOrderItemDocument[]> = model<IServiceOrderItemDocument[]>([]);
  public inputFileId: InputSignal<string> = input('inputFileImages');
  public position: InputSignal<ServiceOrderItemDocPosition> = input<ServiceOrderItemDocPosition>(ServiceOrderItemDocPosition.BEFORE);
  public canAdd: InputSignal<boolean> = input(false);

  private readonly _fileTransfer: FileTransferService = inject(FileTransferService);
  private readonly _toast: ToastService = inject(ToastService);
  private _filesToSend: File[] = [];
  public imgsUrls: WritableSignal<string[]> = signal([]);
  public showGallery: boolean = false;
  public indexGallery: number = 0;
  public readonly docsUrl: string = environment.docsUrl;

  constructor() {
    effect(() => {
      this.setImageUrlList(this.photoList());
    });
  }

  private processResponse(req: Promise<IServiceOrderItemDocument>): void {
    req.then((res: IServiceOrderItemDocument) => {
      const auxList = [...this.photoList()];
      auxList.push(res);
      this.photoList.set(auxList);
    }).catch(() => {
      this._toast.showToastError("Erro ao adicionar imagem!");
    });
  }

  private saveImage(): void {
    const endpoint: string = `api/v1/service-orders/item/${this.soItemId()}/document`;
    const auxFiles = [...this._filesToSend];
    this._filesToSend = [];
    for (let file of auxFiles) {
      const transfer: IFileTransfer = this._fileTransfer.uploadFile(this.getFormData(file), endpoint);
      this.processResponse(transfer.request);

      transfer.retryEvent.pipe(takeUntil(transfer.destroy$)).subscribe({
        next: (req: Promise<IServiceOrderItemDocument>) => {
          this.processResponse(req);
        }
      });
    }

    this.setImageUrlList(this.photoList());
  }

  private getFormData(file: File): FormData {
    const formData: FormData = new FormData();
    formData.append("sevice_order_item_id", `${this.soItemId()}`);
    formData.append("position", `${this.position()}`);
    formData.append("file", file);
    return formData;
  }

  private setImageUrlList(photoList: IServiceOrderItemDocument[]): void {
    const auxList: string[] = []
    photoList.forEach((image: IServiceOrderItemDocument) => {
      auxList.push(`${this.docsUrl}/${image.document.file_path}`);
    });
    this.imgsUrls.set(auxList);
  }

  public toggleGallery(index: number): void {
    this.indexGallery = index;
    this.showGallery = !this.showGallery;
  }

  public onChangeInputFile(event: any): void {
    for (let file of event.target.files) {
      this._filesToSend.push(file);
    }

    if (this._filesToSend.length > 0) this.saveImage();
  }

  public getFakeList(): number[] {
    const missingItems = 2 - this.photoList().length;
    return missingItems > 0 ? Array.from({length: missingItems}, (_, i) => i + 1) : [];
  }
}
