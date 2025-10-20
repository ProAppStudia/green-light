import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IonList, IonItem, IonLabel, IonIcon, IonAccordionGroup, IonAccordion } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonIcon, IonAccordionGroup, IonAccordion]
})
export class SideMenuComponent implements OnInit {
  categories$: Observable<any[]> | undefined;

  constructor(private apiService: ApiService, private router: Router) {
    addIcons({ chevronDownOutline });
  }

  ngOnInit() {
    this.categories$ = this.apiService.getCategories().pipe(
      map(response => {
        return response.categories;
      })
    );
  }
  openCategory(category_id:number){
    this.router.navigate(['/tabs/category', category_id]);
  }
}
