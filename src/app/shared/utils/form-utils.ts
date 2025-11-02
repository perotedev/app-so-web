import {FormGroup} from '@angular/forms';
import {ToastService} from '../services/toast';

export function markDirtyFields(formGroup: FormGroup, toast?: ToastService): void {
  Object.keys(formGroup.controls).forEach((controlName: string) => {
    formGroup.controls[controlName].markAsDirty();
  });

  if (toast) toast.showToastInfo("Preencha os campos obrigatórios corretamente!");
}
