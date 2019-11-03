import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

type Callback = (evt: Event) => void;

export interface Modal {
  show: boolean;
  title: string;
  body: string;
  callback: Callback;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {

  public display$: Subject<Modal> = new Subject<Modal>();

  public toggle(modal: Modal): void {
    this.display$.next(modal);
  }

}
