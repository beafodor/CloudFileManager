import { Injectable } from '@angular/core';

import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx'

import { AngularFireStorage } from '@angular/fire/storage';
import '@firebase/storage';
import { PlatformService } from '../platform/platform.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  uid: string;
  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
    private storage: AngularFireStorage,
    private transfer: FileTransfer,
    public platform: PlatformService
  ) { }

  downloadFile(url) {
    try {
      console.log(url);
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        let blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
    } catch (error) {
      console.log(error);
    }
  }
}
