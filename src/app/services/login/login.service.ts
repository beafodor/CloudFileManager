import { Injectable } from '@angular/core';

import { Router } from '@angular/router';

import { AngularFirestore } from '@angular/fire/firestore';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { AuthService } from '../auth/auth.service';
import { PlatformService } from '../platform/platform.service';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private router: Router,
    private db: AngularFirestore,
    public auth: AuthService,
    public platform: PlatformService,
    private nativeStorage: NativeStorage
  ) { }

  //login and create profile in Firestore
  async login(u) {
    try {
      await this.auth.login(u).then( res => {
        this.saveUser(res);
      });
    } catch (error) {
      console.log(error);
    }
  }

  //Google SignIn - web and android
  async GoogleLogin() {
    try {
      await this.auth.GoogleAuth().then( res => {
        this.saveUser(res);
      });
    } catch(e) {
      console.log(e);
    }
  }

  //save user to Firrestore
  async saveUser(res) {
    if(this.platform.getPlatformType() === 'android') {
      this.nativeStorage.setItem('uid', {uid: res.user.uid}).then(
        () => console.log('Stored item!'),
        error => console.error('Error storing item', error)
      );
      console.log("hello")
    } else {
      localStorage.setItem('uid', res.user.uid);
    }
    this.auth.setUser({
      username: res.user.displayName,
      uid: res.user.uid,
      email: res.user.email,
      isPublic: false
    });
    if(res.user) {
      const userProfile = this.db.collection('profile').doc(res.user.uid);
      userProfile.get().subscribe( r => {
        if(r.exists){
          this.router.navigate(['file']);
        } else {
          this.db.doc(`profile/${this.auth.getUserId()}`).set({
            username: res.user.displayName,
            uid: res.user.uid,
            email: res.user.email,
            isPublic: false
          });
          this.router.navigate(['file']);
        }
      });
    }
  }
}
