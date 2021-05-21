import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { firebaseAuth } from '../../../environments/authconfig';

import { Platform } from '@ionic/angular';
import { Users } from '../../interfaces/user';
import firebase from 'firebase';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { UserService } from '../user/user.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Users;
  userInfo = null;

  folder = "";
  actualFolder = '';

  constructor(
    private router: Router,
    public platform: Platform,
    private db: AngularFirestore,
    private fbAuth: AngularFireAuth,
    public google: GooglePlus,
    public userservice: UserService,
    private nativeStorage: NativeStorage
  ) {}

  //Login with email and password
  async login(u) {
    this.fbAuth.signOut();
    return await new Promise<any>( (resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(u.email, u.password).then(
        res => {
          resolve(res);
          localStorage.setItem('uid', res.user.uid);
        },
        err => reject(err)
      )
    })
  }

  //Google Login - web and android
  async GoogleAuth() {
    this.fbAuth.signOut();
    if(this.platform.is("android")) {
      await this.google.login({
        'scopes':'profile email',

        'webClientId':'162689521172-gmjg10pjqt3fujmlhm972g6sohjn5dl8.apps.googleusercontent.com',
        'offline':true
      }).then( res => {
        if(res) {
          const userToken = res.idToken;
          const userAccessToken = res.accessToken;

          return firebaseAuth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(userToken, userAccessToken));
        }
      });
    } else {
      return await this.fbAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
  }

  //registration method
  async signUp(u) {
    return await new Promise<any>( (resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(u.email, u.password).then(
        res => resolve(res),
        error => reject(error)
      )
    })
  }

  //signOut and navigate back to login
  async signOut() {
    await this.fbAuth.signOut();
    localStorage.clear();
    this.nativeStorage.clear();
    return this.router.navigate(['login']);
  }

  //user getter-setter
  setUser(user: Users) {
    this.user = user;
  }

  getUserId(): string {
    return this.user.uid;
  }

  getUsername(): string {
    return this.user.username;
  }

  getUserEmail(): string {
    return this.user.email;
  }

  getCurrentUsedId(): string {
    if(this.platform.is("android")) {
      this.nativeStorage.getItem('uid').then( res => {
        return res;
      });
    }
    return localStorage.getItem('uid');
  }

  getCurrentUser() {
    return this.db.collection('profile').doc(this.getCurrentUsedId()).get();
  }

  getUserById(uid){
    return this.db.collection('profile').doc(uid).get();
  }

}
