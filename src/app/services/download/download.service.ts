import { Injectable } from '@angular/core';

import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx'

import { AngularFireStorage } from '@angular/fire/storage';
import '@firebase/storage';
import { PlatformService } from '../platform/platform.service';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController } from '@ionic/angular';
import { UploadService } from '../upload/upload.service';
import { shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  uid: string;
  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
    private storage: AngularFireStorage,
    private transfer: FileTransfer,
    public platform: PlatformService,
    private file: File,
    private alertCtrl: AlertController,
    private opener: FileOpener,
    public uploadService: UploadService,
    private http: HttpClient
  ) { }

  async downloadFile(url, name) {
    let path = "";
    if(this.platform.getPlatformType() === 'android' || this.platform.getPlatformType() === 'desktop') path = this.file.dataDirectory;
    else path = this.file.documentsDirectory;
    if(this.platform.getPlatformType() !== 'desktop') {
      try {
        this.fileTransfer.download(url, path + name).then(async entry => {
          console.log("success");
            console.log("halo");
            let alert = await this.alertCtrl.create({
              header: "Downloaded Successfully",
              message: "This file was downloaded successfully",
              buttons: [
                {
                  text: "Open",
                  cssClass: 'secondary',
                  handler: () => {
                    let fileUrl = entry.toURL();
                    this.opener.open(fileUrl, this.uploadService.getFileType(name));
                  }
                },
                {
                  text: "Cancel",
                  cssClass: 'secondary',
                  role: 'cancel'
                }
              ]
            });
            await alert.present();
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        console.log("there");
        this.http.get(url, {responseType: 'blob'}).subscribe((res) => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(res)
          a.href = objectUrl
          a.download = name;
          a.click();
          URL.revokeObjectURL(objectUrl);
        })
      } catch (error) {
        console.log(error);
      }
    }
  }
}
