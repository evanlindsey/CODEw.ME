import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ModalService } from './modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';

export interface Token {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  public tokened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private modal: ModalService, private cookie: CookieService, private spinner: NgxSpinnerService) { }

  public getToken(): void {
    if (this.cookie.get('token') === '') {
      this.spinner.show();
      this.http
        .get<Token>(`${env.SERVER_URL}/api/token`)
        .pipe(
          finalize(() => this.spinner.hide())
        )
        .subscribe((res: Token) => {
          const token = res.token;
          this.cookie.set('token', token);
          this.tokened$.next(true);
        }, (err: HttpErrorResponse) => {
          const show = true;
          const title = 'Response Error';
          const body = 'Token Retrieval Unsuccessful';
          const callback = (evt: Event) => window.location.href = '/';
          this.modal.toggle({ show, title, body, callback });
        });
    } else {
      this.tokened$.next(true);
    }
  }

}
