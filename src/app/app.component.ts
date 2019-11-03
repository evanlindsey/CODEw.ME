import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { ApiService } from './shared/api.service';
import { ModalService, Modal } from './shared/modal.service';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <ngx-spinner
      class="spinner"
      bdOpacity=0.9
      bdColor="#333"
      size="medium"
      color="#fff"
      type="ball-8bits"
      fullScreen="true">
      <p style="color: white"> Loading... </p>
    </ngx-spinner>
    <div bsModal #msgModal="bs-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="msgModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="msgModalLabel">{{modalTitle}}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">{{modalBody}}</div>
          <div class="modal-footer">
            <button #modalCloseBtn type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('msgModal', { static: true }) msgModal: ModalDirective;
  @ViewChild('modalCloseBtn', { static: true }) modalCloseBtn: ElementRef;

  displayModal: Subscription;
  cbVoid: () => void;

  modalTitle = '';
  modalBody = '';

  constructor(private renderer: Renderer2, private api: ApiService, private modal: ModalService) { }

  ngOnInit() {
    this.subscribeToModal();
    this.api.getToken();
  }

  ngOnDestroy() {
    this.displayModal.unsubscribe();
  }

  subscribeToModal() {
    this.displayModal = this.modal.display$.subscribe((modal: Modal) => {
      if (modal.show === true) {
        this.modalTitle = modal.title;
        this.modalBody = modal.body;
        this.renderer.listen(this.modalCloseBtn.nativeElement, 'click', modal.callback);
        this.msgModal.show();
      } else if (modal.show === false) {
        this.modalTitle = '';
        this.modalBody = '';
        this.renderer.listen(this.modalCloseBtn.nativeElement, 'click', this.cbVoid);
        this.msgModal.hide();
      }
    });
  }

}
