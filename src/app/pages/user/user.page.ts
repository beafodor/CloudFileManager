import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { Users } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ManageService } from 'src/app/services/manage/manage.service';
import { PlatformService } from 'src/app/services/platform/platform.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  loggedinUser: string;
  uid: string;
  searchedUser: any;
  publicFiles: any[];
  platformType: string;
  emailString: string;

  routeSub: Subscription = null;

  constructor(
    private activeRoute: ActivatedRoute,
    public auth: AuthService,
    private db: AngularFirestore,
    public manage: ManageService,
    public platform: PlatformService,
    private clipboardApi: ClipboardService
  ) { }

  ngOnInit() {
    this.routeSub = this.activeRoute.params.subscribe(params => {
      this.uid = params.uid;
    });
    this.auth.getUserById(this.uid).subscribe(res => {
      this.searchedUser = res.data();
      this.setUserMail();
      console.log(this.searchedUser);
    });
    console.log(this.uid);
    if(this.auth.getCurrentUsedId){
      this.loggedinUser = this.auth.getCurrentUsedId();
      this.platformType = this.platform.getPlatformType();
      this.getPublicFiles();
    }
  }

  getPublicFiles() {
    this.db.collection('files', ref => ref.where("uid", "==", this.uid)).valueChanges().subscribe(res => {
      this.publicFiles = res;
    });
  }

  clickShare(f) {
    if(this.platformType === "android") {
      this.manage.shareNative(f);
    } else {
      this.clipboardApi.copyFromContent(f);
    }
  }

  setUserMail() {
    this.emailString = "mailto:" + this.searchedUser.email + "com?Subject=ProfilePrivacy&body=Want%20Your%20Profile%20To%20Be%20Public";
  }
}
