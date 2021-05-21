import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AuthGuard } from 'src/app/guards/authGuard/auth.guard';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  pages = [];

  selectedPath = '';
  uid: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    public guard: AuthGuard,
    private menuContoller: MenuController
    ) {
    this.getActive();
    this.uid = this.auth.getCurrentUsedId();
  }

  async getActive() {
    await this.router.events.subscribe((event: RouterEvent) => {
      this.selectedPath = event.url;
      this.uid = this.auth.getCurrentUsedId();
      this.getItems();
    });
  }

  async ngOnInit() {
    await this.getActive();
  }

  getItems() {
    if(this.uid) {
      this.pages = [
        {
          title: 'Home',
          url: '/home',
          icon: 'home'
        },
        {
          title: 'Files',
          url: '/file',
          icon: 'folder'
        },
        {
          title: 'Search',
          url: '/search',
          icon: 'search'
        },
        {
          title: 'Profile',
          url: '/profile',
          icon: 'person'
        }
      ];
    } else {
      this.pages = [
        {
          title: 'Home',
          url: '/home',
          icon: 'home'
        },
        {
          title: 'Login',
          url: '/login',
          icon: 'log-in'
        },
        {
          title: 'Registration',
          url: '/registration',
          icon: 'person-add'
        }
      ];
    }
  }

  onClickMenu() {
    this.menuContoller.close('main-menu');
  }

  logOut() {
    try {
      this.auth.signOut();
      this.getItems();
    } catch (error) {
     console.log(error);
    }
  }
}
