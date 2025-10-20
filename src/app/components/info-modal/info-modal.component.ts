import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

/*import { IonItem, IonLabel, IonList, IonListHeader  } from '@ionic/angular/standalone';*/

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule], /*IonItem, IonLabel, IonList, IonListHeader,*/
})
export class InfoModalComponent implements OnInit {
  @Input() data: any;
  

  constructor(private modalCtrl: ModalController) {
    addIcons({closeOutline});
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}
}
