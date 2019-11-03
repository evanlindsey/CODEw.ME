import {
  Component, ViewEncapsulation, OnInit, OnDestroy, ComponentFactoryResolver,
  ViewChild, ViewContainerRef, ElementRef, ComponentRef, HostListener
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment as env } from '../../environments/environment';

import { Subscription, fromEvent } from 'rxjs';

import { RoomSocketService, Repo, Code } from './shared/room-socket.service';
import { ApiService } from '../shared/api.service';

import { EditorGroupComponent } from './editor-group/editor-group.component';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoomComponent implements OnInit, OnDestroy {

  @ViewChild('themeSelector', { static: true }) themeSelector: ElementRef;
  @ViewChild('editorContainer', { read: ViewContainerRef, static: true }) editorContainer: ViewContainerRef;

  tokened: Subscription;
  connected: Subscription;
  joined: Subscription;
  added: Subscription;
  removed: Subscription;
  coded: Subscription;
  themed: Subscription;

  editorGroupRefs: object = {};

  roomName = '';
  clientId = '';

  constructor(
    private router: Router, private route: ActivatedRoute, private resolver: ComponentFactoryResolver,
    private socket: RoomSocketService, private api: ApiService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => this.roomName = params.get('name'));
    if (!(this.roomName.length < 32)) {
      this.router.navigate(['/not-found']);
    }
    this.clientId = this.getClientId();
    this.subscribeToThemeSelector();
    this.subscribeToSocket();
  }

  ngOnDestroy() {
    this.removeFromSocket();
  }

  @HostListener('window:unload', ['$event'])
  onWindowUnload(evt) {
    this.removeFromSocket();
  }

  getClientId(): string {
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    if (rooms != null) {
      for (const room in rooms) {
        if (room === this.roomName) {
          return rooms[room];
        }
      }
    }
    return null;
  }

  setClientId(id: string): void {
    this.clientId = id;
    let rooms = JSON.parse(localStorage.getItem('rooms'));
    if (rooms == null) {
      rooms = {};
    }
    rooms[this.roomName] = id;
    rooms = JSON.stringify(rooms);
    localStorage.setItem('rooms', rooms);
  }

  subscribeToThemeSelector(): void {
    const themeSelector: HTMLElement = this.themeSelector.nativeElement;
    fromEvent(themeSelector, 'change').subscribe(evt => {
      const theme = (evt.target as HTMLSelectElement).value;
      this.editorGroupRefs[this.clientId].instance.setEditorTheme(theme);
      this.socket.theme(this.roomName, this.clientId, theme);
    });
  }

  subscribeToSocket(): void {
    this.tokened = this.api.tokened$.subscribe((tokened: boolean) => {
      if (tokened === true) {
        this.connected = this.socket.connected$.subscribe((connected: boolean) => {
          if (connected) {
            this.socket.join(this.roomName, this.clientId);
          }
        });
        this.joined = this.socket.joined$.subscribe((id: string) => this.joinRoom(id));
        this.added = this.socket.added$.subscribe((repos: Repo[]) => this.addEditors(repos));
        this.removed = this.socket.removed$.subscribe((repo: Repo) => this.removeEditor(repo));
        this.coded = this.socket.coded$.subscribe((repo: Repo) => this.editorGroupRefs[repo.id].instance.setEditorCode(repo));
        this.themed = this.socket.themed$.subscribe((repo: Repo) => this.editorGroupRefs[repo.id].instance.setEditorTheme(repo.theme));
        this.socket.connect();
      }
    });
  }

  removeFromSocket(): void {
    this.socket.remove(this.roomName, this.clientId);
    this.socket.disconnect();
    this.tokened.unsubscribe();
    this.connected.unsubscribe();
    this.joined.unsubscribe();
    this.added.unsubscribe();
    this.removed.unsubscribe();
    this.coded.unsubscribe();
    this.themed.unsubscribe();
  }

  joinRoom(id: string): void {
    this.setClientId(id);
    this.socket.add(this.roomName);
  }

  addEditors(repos: Repo[]): void {
    if (this.editorGroupRefs[this.clientId] === undefined) {
      let i = 0;
      for (const repo of repos) {
        if (repo.id === this.clientId) {
          const client = repos.splice(i, 1);
          repos.unshift(client[0]);
          break;
        }
        i++;
      }
    }
    repos.forEach((repo) => {
      if (this.editorGroupRefs[repo.id] === undefined) {
        if (repo.theme == null) {
          repo.theme = env.DEFAULT_THEME;
        }
        this.createEditorGroup(repo.id, repo.code, repo.theme);
      }
    });
  }

  removeEditor(repo: Repo): void {
    if (repo.id !== this.clientId) {
      const index = Object.keys(this.editorGroupRefs).indexOf(repo.id);
      this.editorContainer.remove(index);
      delete this.editorGroupRefs[repo.id];
    }
  }

  createEditorGroup(id: string, code: Code, theme: string): void {
    const componentRef = this.createComponent(id);
    componentRef.instance.createEditors(code, theme, (id === this.clientId));
    this.editorGroupRefs[id] = componentRef;
  }

  createComponent(id: string): ComponentRef<EditorGroupComponent> {
    const factory = this.resolver.resolveComponentFactory(EditorGroupComponent);
    const componentRef = this.editorContainer.createComponent(factory);
    componentRef.instance.id = id;
    componentRef.instance.roomName = this.roomName;
    componentRef.changeDetectorRef.detectChanges();
    return componentRef;
  }

}
