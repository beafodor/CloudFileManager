import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { Users } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ManageService } from 'src/app/services/manage/manage.service';
import { PlatformService } from 'src/app/services/platform/platform.service';
import { ClipboardService } from 'ngx-clipboard';
import { DownloadService } from 'src/app/services/download/download.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';

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
    private clipboardApi: ClipboardService,
    public download: DownloadService,
    public notifyService: NotificationsService
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
      this.manage.shareNative(f, f.downloadURL);
    } else {
      this.clipboardApi.copyFromContent(f.downloadURL);
      this.notifyService.showInfo("Copied to clipboard", "This file's url is now copied at your clipboard");
    }
  }

  clickItem(f) {
    window.open(f.downloadURL, '_system');
  }

  clickDownload(f) {
    this.download.downloadFile(f.downloadURL, f.name);
  }

  setUserMail() {
    this.emailString = "mailto:" + this.searchedUser.email + "com?Subject=ProfilePrivacy&body=Want%20Your%20Profile%20To%20Be%20Public";
  }

  clickProfileShare() {
    const url = window.location.href;
    if(this.platformType === "android") {
      this.manage.shareNativeProfile(url);
    } else {
      this.clipboardApi.copyFromContent(url);
      this.notifyService.showInfo("Copied to clipboard", "This profile's url is now copied at your clipboard");
    }
  }
}
