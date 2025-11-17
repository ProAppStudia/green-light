import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
/*import { IonItem, IonLabel, IonList, IonListHeader  } from '@ionic/angular/standalone';*/

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: true,
  imports: [TranslateModule, IonicModule, CommonModule], /*IonItem, IonLabel, IonList, IonListHeader,*/
})
export class InfoModalComponent implements OnInit {
  @Input() data: any;
  

  constructor(
    private modalCtrl: ModalController,
    private auth: AuthService,
    private translate: TranslateService
  ) {
    addIcons({closeOutline});
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {

    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.translate.use(lang_code);
      }else{
        this.translate.use('ua');
      }
    });

  }
}
