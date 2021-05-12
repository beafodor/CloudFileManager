import { Component, OnInit } from '@angular/core';

import { UploadService } from 'src/app/services/upload/upload.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ManageService } from 'src/app/services/manage/manage.service';
import { PlatformService } from 'src/app/services/platform/platform.service';
import { Upload } from 'src/app/interfaces/upload';

import { AngularFireStorage } from '@angular/fire/storage';
import firebase from 'firebase';

import * as _ from "lodash";
import { DownloadService } from 'src/app/services/download/download.service';
import { ChunkService } from 'src/app/services/chunk/chunk.service';
import { ClipboardService } from 'ngx-clipboard';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-file',
  templateUrl: './file.page.html',
  styleUrls: ['./file.page.scss'],
})
export class FilePage implements OnInit {

  userId: string;
  folder = '/files/';
  actualFolder = '/files/';
  cloudFiles = [];
  directories = [];
  previous = "";
  platformType = "";
  selectedFiles: FileList;
  files: File[] = []
  currentUpload: Upload;
  isHovering: boolean;
  downloadUrl: string;
  currentName: string;
  maxElement = 6;
  page: number;
  sortedFiles = [];
  maxPage: number;

  constructor(
    private storage: AngularFireStorage,
    public upload: UploadService,
    public auth: AuthService,
    public platform: PlatformService,
    public manage: ManageService,
    public download : DownloadService,
    public chunk: ChunkService,
    private clipboardApi: ClipboardService,
    public notifyService: NotificationsService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    if (this.auth.getCurrentUsedId()) {
      this.userId = this.auth.getCurrentUsedId();
      this.folder = '/files/' + this.auth.getCurrentUsedId();
      this.actualFolder = this.folder;
      this.platformType = this.platform.getPlatformType();
      this.loadFiles();
    }
  }

  //load files and directories
  async loadFiles() {
    this.cloudFiles = [];
    await this.storage.ref(this.actualFolder).listAll().subscribe(res => {
      (res as any)._delegate.prefixes.forEach(ref => {
        let cutName = (ref as any)._location.path;
        cutName = cutName.substring(cutName.lastIndexOf('/')+1);
        this.cloudFiles.push({
          name: cutName,
          fullPath: (ref as any)._location.path + "/",
          ext: "0",
          isDirectory: true
        });
      })
    }, (e) => {console.log(e)});
    const storageRef = await firebase.storage().ref(this.actualFolder);
    storageRef.listAll().then(res => {
      res.items.forEach(async ref => {
        if(ref.name !== " ") {
          this.cloudFiles.push({
            name: ref.name,
            path: ref.fullPath,
            url: await ref.getDownloadURL(),
            isPublic: true,
            ext: ref.name.substring(ref.name.lastIndexOf(".")+1, ref.name.length),
            isDirectory: false
          });
        }
      });
    }, (e) => {console.log(e)});

    this.fileSort();
  }

  fileSort() {
    this.maxPage = Math.ceil(this.cloudFiles.length / 6);
    this.cloudFiles.sort((a, b) => a["name"].localCompare(b["name"]));
    this.sortedFiles = this.cloudFiles.slice(this.page * this.maxElement, (this.page+1) * this.maxElement);
    console.log(this.cloudFiles);
    console.log(this.sortedFiles);
  }

  nextPage() {
    if(this.sortedFiles.length == 6) {
      this.page++;
      this.fileSort();
    }
  }

  prevPage() {
    if(this.page > 0) {
      this.page--;
      this.fileSort();
    }
  }

  //Dropzone methodes
  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i));
    }
    this.uploadDragnDrop();
  }

  detectFiles(event) {
    this.selectedFiles = event.target.files;
    this.uploadFromWeb();
  }

  //upload from web - drop & input
  uploadBlobDragnDrop() {
    let upDir = this.actualFolder + '/';
    let files = this.files;
    let filesIndex = _.range(files.length)
    _.each(filesIndex, async (idx) => {
      console.log(files[idx]);
      this.currentUpload = new Upload(files[idx]);
      this.currentName = files[idx].name;

      this.chunk.calculateSize(this.currentUpload).then(res => {
        // upload chunks
        let index = 0;
        res.forEach(chunk => {
          let uint8 = new Uint8Array(chunk);
          let blob = new Blob([uint8.buffer]);
          this.upload.uploadBlobToFirebaseWeb(blob, upDir, index, this.currentName);
          index++;
        });
      })
    });
  }

  uploadDragnDrop() {
    let upDir = this.actualFolder + '/';
    let files = this.files;
    let filesIndex = _.range(files.length)
    _.each(filesIndex, async (idx) => {
      console.log(files[idx]);
      this.currentUpload = new Upload(files[idx]);
      this.currentName = files[idx].name;
      this.upload.uploadToFirebaseWeb(this.currentUpload, upDir);
    });
  }

  uploadFromBlobWeb() {
    let upDir = this.actualFolder + '/';
    let files = this.selectedFiles;
    let filesIndex = _.range(files.length)
    _.each(filesIndex, (idx) => {
      this.currentUpload = new Upload(files[idx]);
      this.currentName = files[idx].name;

      this.chunk.calculateSize(this.currentUpload).then(res => {
        console.log(this.chunk.chunkSizes)

        // upload chunks
        let index = 0;
        res.forEach(chunk => {
          let uint8 = new Uint8Array(chunk);
          let blob = new Blob([uint8.buffer]);
          this.upload.uploadBlobToFirebaseWeb(blob, upDir, index, this.currentName);
          index++;
        });
      })
    });
  }

  uploadFromWeb() {
    let upDir = this.actualFolder + '/';
    let files = this.selectedFiles;
    let filesIndex = _.range(files.length)
    _.each(filesIndex, (idx) => {
      this.currentUpload = new Upload(files[idx]);
      this.currentName = files[idx].name;
      this.upload.uploadToFirebaseWeb(this.currentUpload, upDir);
    });
  }

  //upload from native app
  async clickUpload() {
    let upDir = this.actualFolder + '/';
    await this.upload.chooseFile(upDir).then(() =>{
      if(this.upload.isDone) {
        this.loadFiles();
      }
    });
  }

  async clickDownload(f) {
    await this.download.downloadFile(f.url);
  }

  //nav back between folders
  goBack() {
    this.actualFolder = this.actualFolder.slice(0, -this.previous.length-1);
    this.previous = this.actualFolder.slice(this.actualFolder.lastIndexOf('/'), this.actualFolder.length-1);
    this.loadFiles();
    console.log(this.actualFolder);
  }

  //nav forward between folders
  async clickItem(f) {
    if(f.isDirectory) {
      this.previous = f.name;
      this.actualFolder = '/' + f.fullPath.slice(0, -1);
      this.loadFiles();
    } else {
      let alert = await this.alertCtrl.create({
        header: 'What do you want to do?',
        message: 'What do you want to do with this file?',
        buttons: [
          {
            text: 'Open',
            cssClass: 'secondary',
            handler: () => {
              window.open(f.url, '_system');
            }
          },
          {
            text: 'Download',
            cssClass: 'secondary',
            handler: () => {
              this.download.downloadFile(f.url);
            }
          },
          {
            text: 'Cancel',
            cssClass: 'danger',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
    }
  }

  //create new folder
  async clickCreate() {
    await this.manage.createFolder(this.actualFolder);
    this.loadFiles();
  }

  //delete - just files and dirs with only files in it yet
  async clickDel(f) {
    await this.manage.delete(f);
    this.loadFiles();
  }

  clickShare(f) {
    if(this.platformType === "android") {
      this.manage.shareNative(f, f.url);
    } else {
      this.clipboardApi.copyFromContent(f.url);
      this.notifyService.showInfo("Copied to clipboard", "This file's url is now copied at your clipboard");
    }
  }
}
