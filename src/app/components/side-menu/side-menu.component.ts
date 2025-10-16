import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IonList, IonItem, IonLabel, IonIcon, IonAccordionGroup, IonAccordion } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonIcon, IonAccordionGroup, IonAccordion]
})
export class SideMenuComponent implements OnInit {
  categories$: Observable<any[]> | undefined;

  constructor(private apiService: ApiService) {
    addIcons({ chevronDownOutline });
  }

  ngOnInit() {
    this.categories$ = this.apiService.getCategories().pipe(
      map(response => {
        console.log('Categories for side menu (parsed):', JSON.stringify(response, null, 2));
        return response.categories;
      })
    );
  }
}
