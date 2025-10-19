import { Component, Input, OnInit } from '@angular/core';

import { IonicModule, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: true,
  imports: [IonicModule], // для Ionic компонентів (ion-header, ion-content тощо)
})
export class InfoModalComponent implements OnInit {
  @Input() data: any;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}
}
