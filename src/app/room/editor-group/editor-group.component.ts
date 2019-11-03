import { Component, HostBinding, Input, ViewChild, ElementRef } from '@angular/core';
import { environment as env } from '../../../environments/environment';

import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';

import { EditorTemplateService } from '../shared/editor-template.service';
import { RoomSocketService, Repo, Code } from '../shared/room-socket.service';

@Component({
  selector: 'app-room-editor',
  template: `
    <tabset>
      <tab>
        <ng-template tabHeading>
          <span tooltip="View JavaScript Code" placement="top">JS</span>
        </ng-template>
        <div #jsEdit id="edit-js-{{id}}" class="editor"></div>
      </tab>
      <tab>
        <ng-template tabHeading>
          <span tooltip="View HTML Code" placement="top">HTML</span>
        </ng-template>
        <div #htmlEdit id="edit-html-{{id}}" class="editor"></div>
      </tab>
      <tab>
        <ng-template tabHeading>
          <span tooltip="View CSS Code" placement="top">CSS</span>
        </ng-template>
        <div #cssEdit id="edit-css-{{id}}" class="editor"></div>
      </tab>
      <tab (selectTab)="resultClick()">
        <ng-template tabHeading>
          <span tooltip="Execute Code & View Result" placement="top">RESULT</span>
        </ng-template>
        <iframe #resultFrame sandbox="allow-scripts allow-modals" class="editor"></iframe>
        <div class="console">
          <label #logLabel class="entry log"></label>
          <label #errLabel class="entry err"></label>
        </div>
      </tab>
    </tabset>
  `
})
export class EditorGroupComponent {

  @ViewChild('jsEdit', { static: true }) jsEdit: ElementRef;
  @ViewChild('htmlEdit', { static: true }) htmlEdit: ElementRef;
  @ViewChild('cssEdit', { static: true }) cssEdit: ElementRef;
  @ViewChild('resultFrame', { static: true }) resultFrame: ElementRef;
  @ViewChild('logLabel', { static: true }) logLabel: ElementRef;
  @ViewChild('errLabel', { static: true }) errLabel: ElementRef;

  @HostBinding('class') class = 'col-sm-6';
  @Input() roomName = '';
  @Input() id = '';

  jsEditRef: any;
  htmlEditRef: any;
  cssEditRef: any;

  constructor(private template: EditorTemplateService, private socket: RoomSocketService) {
    this.setAcePaths();
  }

  setAcePaths(): void {
    ace.config.set('basePath', env.ACE_CDN);
    ace.config.set('modePath', env.ACE_CDN);
    ace.config.set('themePath', env.ACE_CDN);
    ace.config.set('workerPath', env.ACE_CDN);
  }

  createEditors(code: Code, theme: string, isUser: boolean): void {
    this.jsEditRef = ace.edit(`edit-js-${this.id}`);
    this.htmlEditRef = ace.edit(`edit-html-${this.id}`);
    this.cssEditRef = ace.edit(`edit-css-${this.id}`);

    this.jsEditRef.setTheme(`ace/theme/${theme}`);
    this.htmlEditRef.setTheme(`ace/theme/${theme}`);
    this.cssEditRef.setTheme(`ace/theme/${theme}`);

    this.jsEditRef.getSession().setMode('ace/mode/javascript');
    this.htmlEditRef.getSession().setMode('ace/mode/html');
    this.cssEditRef.getSession().setMode('ace/mode/css');

    if (code.js === '') {
      code.js = this.template.JS_STARTER.replace(/\t/g, '');
    }
    if (code.html === '') {
      code.html = this.template.HTML_STARTER.replace(/\t/g, '');
    }
    if (code.css === '') {
      code.css = this.template.CSS_STARTER.replace(/\t/g, '');
    }

    this.jsEditRef.setValue(code.js, 1);
    this.htmlEditRef.setValue(code.html, 1);
    this.cssEditRef.setValue(code.css, 1);

    if (isUser) {
      this.subscribeToUserInput(this.id);
    } else {
      this.jsEditRef.setReadOnly(true);
      this.htmlEditRef.setReadOnly(true);
      this.cssEditRef.setReadOnly(true);
    }

    this.setIframeListener();
  }

  subscribeToUserInput(id: string): void {
    fromEvent(this.jsEdit.nativeElement as HTMLElement, 'keyup')
      .pipe(
        map(evt => (evt.target as HTMLInputElement).value),
        debounceTime(500)
      ).subscribe(val => {
        const code = this.jsEditRef.getValue();
        this.socket.code(this.roomName, id, code, 'js');
      });
    fromEvent(this.htmlEdit.nativeElement as HTMLElement, 'keyup')
      .pipe(
        map(evt => (evt.target as HTMLInputElement).value),
        debounceTime(500)
      ).subscribe(val => {
        const code = this.htmlEditRef.getValue();
        this.socket.code(this.roomName, id, code, 'html');
      });
    fromEvent(this.cssEdit.nativeElement as HTMLElement, 'keyup')
      .pipe(
        map(evt => (evt.target as HTMLInputElement).value),
        debounceTime(500)
      ).subscribe(val => {
        const code = this.cssEditRef.getValue();
        this.socket.code(this.roomName, id, code, 'css');
      });
  }

  setIframeListener(): void {
    window.addEventListener('message', (evt) => {
      if (evt.origin === 'null' && evt.source === this.resultFrame.nativeElement.contentWindow) {
        const entry = evt.data;
        if (entry.substring(0, 3) === 'CON') {
          this.logLabel.nativeElement.innerHTML = entry;
        } else if (entry.substring(0, 3) === 'ERR') {
          this.errLabel.nativeElement.innerHTML = entry;
        }
      }
    });
  }

  resultClick() {
    this.logLabel.nativeElement.innerHTML = '';
    this.errLabel.nativeElement.innerHTML = '';
    this.executeCode();
  }

  executeCode(): void {
    const jsCode = this.jsEditRef.getValue();
    const htmlCode = this.htmlEditRef.getValue();
    const cssCode = this.cssEditRef.getValue();
    const result = this.template.codeResult(jsCode, htmlCode, cssCode);
    const blob = new Blob([result], { type: 'text/html' });
    (this.resultFrame.nativeElement as HTMLIFrameElement).src = URL.createObjectURL(blob);
  }

  setEditorCode(repo: Repo): void {
    if (repo.lang === 'js') {
      this.jsEditRef.setValue(repo.code, 1);
    } else if (repo.lang === 'html') {
      this.htmlEditRef.setValue(repo.code, 1);
    } else if (repo.lang === 'css') {
      this.cssEditRef.setValue(repo.code, 1);
    }
  }

  setEditorTheme(theme: string): void {
    this.jsEditRef.setTheme(`ace/theme/${theme}`);
    this.htmlEditRef.setTheme(`ace/theme/${theme}`);
    this.cssEditRef.setTheme(`ace/theme/${theme}`);
  }

}
