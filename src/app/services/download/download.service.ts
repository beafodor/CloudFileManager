import { Injectable } from '@angular/core';

import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx'

import { AngularFireStorage } from '@angular/fire/storage';
import '@firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  uid: string;
  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
    private storage: AngularFireStorage,
    private transfer: FileTransfer
  ) { }

  downloadFile(f) {
    console.log(f);
    const ref = this.storage.ref('/' + f.path);
    const url = ref.getDownloadURL().toString();
    try {
      this.fileTransfer.download(url, 'files/downloads/' + f.name);
    } catch (error) {
      console.log(error);
    }
  }
}
