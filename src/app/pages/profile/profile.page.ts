import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { Users } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import firebase from 'firebase/app';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  uname: string;
  uemail: string;
  uid: string;
  size: number;
  newUser: Users;
  user: any;
  data: any;
  ownFiles :any[];

  constructor(
    public auth: AuthService,
    private alertCtrl: AlertController,
    private db: AngularFirestore
  ) {}

  ngOnInit() {
    this.auth.getCurrentUser().subscribe(async (res) => {
      this.user = res.data();
      await this.getStats();
    });
  }

  getStats() {
    console.log(this.user.uid)
    this.db.collection('files', ref => ref.where("uid", "==", this.user.id)).valueChanges().subscribe(res => {
      console.log(res);
    });
    console.log(this.data);
  }


  async changeUsername() {
    let alert = await this.alertCtrl.create({
      header: 'Change Username',
      message: 'Fill it with your new username',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'New Username'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Save',
          handler: async data => {
            const userProfile = this.db.doc(`profile/${this.user.uid}`).set({
              email: this.user.email,
              uid: this.user.uid,
              username: data.username,
              isPublic: this.user.isPublic
            });
            this.newUser = {
              email: this.user.email,
              uid: this.user.uid,
              username: data.username,
              isPublic: this.user.isPublic
            };
            this.auth.setUser(this.newUser);
            const currentUser = firebase.auth().currentUser;
            currentUser.updateProfile({
              displayName: data.username
            });
            this.user = this.newUser;
          }
        }
      ]
    });
    await alert.present();
  }

  async changePassword() {
    let alert = await this.alertCtrl.create({
      header: 'Change Password',
      message: 'Fill it with your new password',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'New Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Save',
          handler: async data => {
            const currentUser = firebase.auth().currentUser;
            currentUser.updatePassword(data.password);
          }
        }
      ]
    });
    await alert.present();
  }

  async setProfilePrivacy() {
    let actualPrivacy = this.user.isPublic;
    let alert = await this.alertCtrl.create({
      header: 'Profile Privacy',
      message: 'If You set your profile to public your public files will be available to other users.',
      inputs: [
        {
          value: 'public',
          type: 'radio',
          label: 'Public',
          checked: actualPrivacy
        },
        {
          value: 'private',
          type: 'radio',
          label: 'Private',
          checked: (!actualPrivacy)
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Save',
          handler: async data => {
            let privacy;
            if(data === 'public') privacy = true;
            if(data === 'private') privacy = false;
            const userProfile = this.db.doc(`profile/${this.user.uid}`).set({
              email: this.user.email,
              isPublic: privacy,
              uid: this.user.uid,
              username: this.user.username
            });
            console.log(userProfile);
            this.newUser = {
              email: this.user.email,
              isPublic: privacy,
              uid: this.user.uid,
              username: this.user.username
            };
            this.user = this.newUser;
          }
        }
      ]
    });
    await alert.present();
  }

  async clearStorage() {
    let alert = await this.alertCtrl.create({
      header: 'Clear Storage',
      message: 'Are You sure that you want to clear Your storage? All files will be deleted',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Sure',
          handler: async data => {
            //delete files from storage
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteProfile() {
    let alert = await this.alertCtrl.create({
      header: 'Delete Profile',
      message: 'Are You sure that want to delete Your profile?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Sure',
          cssClass: 'danger',
          handler: async data => {
            const currentUser = firebase.auth().currentUser;
            currentUser.delete();
            this.db.doc(`profile/${this.user.uid}`).delete();
            //delete files from storage
          }
        }
      ]
    });
    await alert.present();
  }
}
