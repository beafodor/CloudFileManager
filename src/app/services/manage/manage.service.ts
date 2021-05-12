import { Injectable } from '@angular/core';

import { AlertController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ToastController } from '@ionic/angular';

import { AngularFireStorage } from '@angular/fire/storage';
import firebase from 'firebase';
import '@firebase/storage';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private alertCtrl: AlertController,
    private clipboard: Clipboard,
    private toast: ToastController
  ) { }

  async delete(f) {
    if(f.isDirectory) {
      let deleteDir = '/' + f.fullPath;
      await firebase.storage().ref(deleteDir).listAll().then( res => {
        res.items.forEach(async r => {
          this.storage.ref(r.fullPath).delete();
        })
      });
      await this.storage.ref(deleteDir).listAll().subscribe(res => {
        (res as any)._delegate.prefixes.forEach(res => {
          let nextDir = this.storage.ref(res._location.path);
          this.delete(nextDir);
        });
      });
    } else {
      this.storage.ref(f.path).delete();
    }
  }

  async createFolder(aF) {
    let alert = await this.alertCtrl.create({
      header: 'Create folder',
      message: 'Folder name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'New Folder'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Create',
          handler: async data => {
            console.log(aF);
            let folder = this.storage.ref(aF + '/' + `${data.name}/` + " ");

            folder.put(null);
          }
        }
      ]
    });
    await alert.present();
  }

  shareNative(f, url) {
    this.clipboard.clear();
    if(f.isPublic) {
      this.clipboard.copy(url);
      this.toast.create({
        message: "This file's download url copied to clipboard",
        duration: 3000,
        position: 'bottom'
      });
    } else {
      this.toast.create({
        message: "This file' is private. Please, check the file's privacy settings!",
        duration: 3000,
        position: 'bottom'
      });
    }
  }
}
