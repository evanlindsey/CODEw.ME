import { NgModule } from '@angular/core';

import { RoomComponent } from './room.component';
import { EditorGroupComponent } from './editor-group/editor-group.component';

import { RoomSocketService } from './shared/room-socket.service';
import { EditorTemplateService } from './shared/editor-template.service';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
  declarations: [
    RoomComponent,
    EditorGroupComponent
  ],
  entryComponents: [
    EditorGroupComponent
  ],
  imports: [
    TabsModule.forRoot(),
    TooltipModule.forRoot()
  ],
  providers: [RoomSocketService, EditorTemplateService]
})
export class RoomModule { }
