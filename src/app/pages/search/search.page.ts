import { Component, OnInit } from '@angular/core';

import { first } from 'rxjs/operators';

import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  public userId: string;
  public userList: any[];
  public userListBackup: any[];
  public searchMethod = "username";

  constructor(
    private router: Router,
    private auth: AuthService,
    private db: AngularFirestore
  ) { }

  async ngOnInit() {
    if(this.auth.getCurrentUsedId){
      this.userId = this.auth.getCurrentUsedId();
      await this.initItems();
    }
  }

  async initItems(): Promise<any> {
    const userList = await this.db.collection('profile').valueChanges().pipe(first()).toPromise();
    this.userListBackup = userList;
    return userList;
  }

  async listUsers(evt) {
    this.userList = [];
    const searchTerm = evt.srcElement.value;



    if(!searchTerm) {
      return;
    }

    if(this.searchMethod[1] === "email"){
      console.log(this.searchMethod[0]);
      this.userList = this.userListBackup.filter( res => {
        if(res.username && searchTerm) {
          return (res.username.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || res.email.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
        }
      });
    } else if(this.searchMethod === "username" || this.searchMethod[0] === "username") {
      this.userList = this.userListBackup.filter( res => {
        if(res.username && searchTerm) {
          return (res.username.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
        }
      });
    } else if(this.searchMethod[0] === "email") {
      this.userList = this.userListBackup.filter( res => {
        if(res.email && searchTerm) {
          return (res.email.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
        }
      });
    }
  }

  goToUserProfile(uid) {
    this.router.navigate([`user/${uid}`]);
  }
}
