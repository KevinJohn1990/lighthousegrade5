import { Component, OnInit, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { UtilService } from '../utils/util.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss', '../utils/shared.scss'],
})
export class HomePage implements OnInit {
  gradeTitle = environment.gradeTitle;
  private authStateSubs: Subscription = null;
  constructor(
    private authService: AuthService,
    private utilService: UtilService
  ) {}

  email: string = '';
  headerTitle: string = 'Praise the Lord';
  ngOnInit(): void {
    this.authStateSubs = this.authService.getAuthState().subscribe(
      (user) => {
        if (user) {
          this.email = this.authService.getLoggedInUserEmail();
          if (this.email == '' || this.email.toLowerCase() == 'null') {
            this.headerTitle = 'Praise the Lord';
          } else {
            this.headerTitle = 'Praise the Lord, Welcome ' + this.email;
          }
        } else {
          this.headerTitle = 'Praise the Lord';
        }
      },
      (err) => (this.headerTitle = 'Praise the Lord')
    );
  }

  // showTheme: boolean = false;
  // changeStyle(color: string = "#5260ff") {
  //   localStorage.setItem('theme-color', color);
  //   var root: any = document.querySelector(":root");
  //   root.style.setProperty('--ion-color-tertiary', color);
  //   root.style.setProperty('--var-color-boxshadow', 'var(--ion-color-tertiary)');
  // }

  ngOnDestroy() {
    this.utilService.unSubscribeSubscription(this.authStateSubs);
  }
}
