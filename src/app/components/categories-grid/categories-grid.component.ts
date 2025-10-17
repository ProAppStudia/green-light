import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-categories-grid',
  templateUrl: './categories-grid.component.html',
  styleUrls: ['./categories-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg]
})
export class CategoriesGridComponent implements OnInit {
  @Input() categories: any[] = [];

  constructor() { }

  ngOnInit() {
    console.log('Categories received in grid:', this.categories);
  }
}
