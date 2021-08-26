import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { Subject } from 'rxjs';

import { io, Socket } from 'socket.io-client';

import { ModalService } from '../../shared/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';

export interface Code {
  js: string;
  html: string;
  css: string;
}

export interface Repo {
  id: string;
  code?: Code;
  lang?: string;
  theme?: string;
}

@Injectable()
export class RoomSocketService {

  private socket: Socket;
  private socketUrl = '';
  private token = '';

  public connected$: Subject<boolean> = new Subject<boolean>();
  public errored$: Subject<boolean> = new Subject<boolean>();
  public joined$: Subject<string> = new Subject<string>();
  public added$: Subject<Repo[]> = new Subject<Repo[]>();
  public removed$: Subject<Repo> = new Subject<Repo>();
  public coded$: Subject<Repo> = new Subject<Repo>();
  public themed$: Subject<Repo> = new Subject<Repo>();

  constructor(private modal: ModalService, private cookie: CookieService, private spinner: NgxSpinnerService) { }

  private setListeners(): void {
    this.socket.on('added', (data: Repo[]) => {
      if (data[0].id === 'full') {
        const show = true;
        const title = 'Room Full';
        const body = 'Client Limit Exceeded';
        const callback = (evt: Event) => window.location.href = '/';
        this.modal.toggle({ show, title, body, callback });
      } else {
        this.added$.next(data);
      }
    });
    this.socket.on('removed', (data: Repo) => this.removed$.next(data));
    this.socket.on('coded', (data: Repo) => this.coded$.next(data));
    this.socket.on('themed', (data: Repo) => this.themed$.next(data));
  }

  public connect(): void {
    this.socketUrl = `${env.SERVER_URL}/socket`;
    this.token = this.cookie.get('token');

    this.spinner.show();
    this.socket = io(this.socketUrl);
    this.socket.on('connect', () => {
      this.spinner.hide();
      this.connected$.next(true);
      this.setListeners();
    });
    this.socket.on('connect_error', () => {
      this.spinner.hide();
      const show = true;
      const title = 'Connection Error';
      const body = 'Socket Handshake Unsuccessful';
      const callback = (evt: Event) => window.location.href = '/';
      this.modal.toggle({ show, title, body, callback });
    });
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public join(roomName: string, clientId: string): void {
    this.socket.emit('join', this.token, roomName, clientId, (id: string) => this.joined$.next(id));
  }

  public add(roomName: string): void {
    this.socket.emit('add', roomName);
  }

  public remove(roomName: string, clientId: string): void {
    this.socket.emit('remove', this.token, roomName, clientId);
  }

  public code(roomName: string, clientId: string, code: string, lang: string): void {
    this.socket.emit('code', this.token, roomName, clientId, code, lang);
  }

  public theme(roomName: string, clientId: string, theme: string): void {
    this.socket.emit('theme', this.token, roomName, clientId, theme);
  }

}
