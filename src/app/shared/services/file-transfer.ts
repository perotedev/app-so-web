import {inject, Injectable, InjectionToken, signal, Signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, Subject, takeUntil} from "rxjs";
import {ToastService} from './toast';
import {IFileTransfer, IFileTransferList} from '../interfaces/IFileTransfer';
import {environment} from '../../../environments/environment';

export const FILE_TRANSFER = new InjectionToken('FILE_TRANSFER');
export const ROUTE_FILES_ZIP: string = "api/v1/doc/zip";
export const ROUTE_FILE_SEND: string = "api/v1/doc/upload";
@Injectable({
  providedIn: 'root'
})
export class FileTransferService {
  private readonly _fileTransfer: WritableSignal<IFileTransferList> = signal({hasTransfers: false, finishTransfer: true, transfers: []});
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _toast: ToastService = inject(ToastService);

  constructor() { }

  get fileTransfer(): Signal<IFileTransferList> {
    return this._fileTransfer;
  }


  private processRequest(req: Promise<any>, transfer: IFileTransfer): void {
    req.then((response) => {
      transfer.progress = 100;
      if (transfer.transferType === 'download') {
        transfer.blob = response;
        this.downloadObject(response, transfer.fileName);
      }
    }).catch((error) => {
      transfer.progress = 0;
      transfer.error =  error.message??'Erro ao transferir arquivo';
    }).finally(() => {
      transfer.loading = false;
      transfer.destroy$.complete();
      transfer.destroy$.complete();
      this.updateStateFinish();
    });
  }

  private updateState(): void {
    this._fileTransfer.update((state: IFileTransferList) => ({
      ...state,
      hasTransfers: state.transfers.length > 0
    }));
  }

  private updateStateFinish(): void {
    this._fileTransfer.update((state: IFileTransferList) => ({
      ...state,
      finishTransfer: !state.transfers.some(transfer => transfer.loading)
    }));
  }

  private pushTransfer(transfer: IFileTransfer): void {
    this._fileTransfer.update((state: IFileTransferList) => {
      state.transfers.push(transfer);
      return {...state};
    });
  }

  private downloadObject(file: File | Blob, filename?: string): void {
    const url: string = window.URL.createObjectURL(file);
    const link: HTMLAnchorElement = document.createElement('a');
    let fileName: string = filename??'download';
    if (file instanceof File) fileName = file.name;

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  public removeTransfer(index: number): void {
    this._fileTransfer.update((state: IFileTransferList) => {
      state.transfers.splice(index, 1);
      return {...state};
    });
    this.updateState();
  }

  public uploadFile(body: FormData, endpoint: string): IFileTransfer {
    const destroyAux$ = new Subject<void>();
    this._fileTransfer.update((state: IFileTransferList) => ({...state, hasTransfers: true, finishTransfer: false}));
    const req: Promise<any> = lastValueFrom(this._http.post(`${environment.apiUrl}/${endpoint}`, body).pipe(takeUntil(destroyAux$)));
    const file = body.get('file');
    const transfer = {
      loading: true,
      progress: 0,
      transferType: 'upload',
      destroy$: destroyAux$,
      url: endpoint,
      icon: 'pi pi-upload',
      body: body,
      httpMethod: 'post',
      request: req,
      retryEvent: new Subject(),
      fileName:file instanceof File ? file.name : 'Arquivo Anexo'
    } satisfies IFileTransfer;

    this.pushTransfer(transfer);
    this.processRequest(req, transfer);
    this.updateState();
    return transfer;
  }

  public downloadFile(endpoint: string, type: 'post' | 'get', body?:any, filename?: string): IFileTransfer {
    const existingTransferIndex = this._fileTransfer().transfers.findIndex(
      t => t.fileName === (filename??"")
    );
    if (existingTransferIndex !== -1) {
      this._toast.showToastInfo('Este arquivo já está na lista de downloads!');
      return {} as IFileTransfer;
    }

    const downloadingCount = this._fileTransfer().transfers.filter(t => t.transferType === 'download' && t.loading).length;
    if (downloadingCount > 5) {
      this._toast.showToastInfo('Você pode fazer no máximo 5 downloads simultaneamente!');
      return {} as IFileTransfer;
    }

    const destroyAux$ = new Subject<void>();
    this._fileTransfer.update((state: IFileTransferList) => ({...state, hasTransfers: true, finishTransfer: false}));
    const req: Promise<any> = type ==='post'
      ?lastValueFrom(this._http.post(`${environment.apiUrl}/${endpoint}`, body, {
        responseType: 'blob'
      }).pipe(takeUntil(destroyAux$)))
      :lastValueFrom(this._http.get(`${environment.apiUrl}/${endpoint}`, {
        responseType: 'blob'
      }).pipe(takeUntil(destroyAux$)));

    const transfer = {
      loading: true,
      progress: 0,
      body: body,
      transferType: 'download',
      destroy$: destroyAux$,
      url: endpoint,
      icon: 'pi pi-download',
      httpMethod: type,
      request: req,
      retryEvent: new Subject(),
      fileName: filename || 'Arquivo Anexo'
    } satisfies IFileTransfer;

    this.pushTransfer(transfer);
    this.processRequest(req, transfer);
    this.updateState();
    return transfer;
  }

  private retryRequest(transfer: IFileTransfer, body: any): Promise<any> {
    return transfer.httpMethod ==='post'
      ?lastValueFrom(this._http.post(`${environment.apiUrl}/${transfer.url}`, body, {
        responseType: 'blob'
      }).pipe(takeUntil(transfer.destroy$)))
      :lastValueFrom(this._http.get(`${environment.apiUrl}/${transfer.url}`, {
        responseType: 'blob'
      }).pipe(takeUntil(transfer.destroy$)));

  }

  public triggerAction(transfer: IFileTransfer): void {
    if (!transfer.loading) {
      if (transfer.transferType === 'download' && transfer.blob !== undefined) {
        this.downloadObject(transfer.blob, transfer.fileName);
        return;
      }

      if (transfer.error === undefined && transfer.transferType === 'upload') return;

      transfer.loading = true;
      transfer.progress = 0;
      transfer.error = undefined;
      transfer.destroy$.next();
      transfer.destroy$.complete();
      transfer.destroy$ = new Subject();
      const req = this.retryRequest(transfer, transfer.body);
      transfer.request = req;
      transfer.retryEvent.next(req);
      this.processRequest(req, transfer);
      this.updateState();
    }
  }

  public closeAll(): void {
    this._fileTransfer.update((state: IFileTransferList) => {
      state.transfers.forEach((transfer: IFileTransfer) => {
        transfer.destroy$.next()
        transfer.destroy$.complete();
        transfer.retryEvent.complete();
      });
      state.transfers = [];
      state.hasTransfers = false;
      return {...state};
    });
  }

  public cancelOne(transfer: IFileTransfer): void {
    if (transfer.loading) {
      transfer.destroy$.next();
      transfer.destroy$.complete();
    }

    const index = this._fileTransfer().transfers.findIndex(t => t.fileName === transfer.fileName);
    if (index !== -1) this.removeTransfer(index);
  }
}
