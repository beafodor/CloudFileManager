import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { File } from '@ionic-native/file/ngx';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import '@firebase/storage';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  uid: string;
  task: AngularFireUploadTask;
  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: string;
  isOn = false;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private file: File,
    public auth: AuthService
    ) {}

  isActive(s) {
    return s.state === "running" && s.bytesTransferred < s.totalBytes;
  }

  isDone(s) {
    return s.bytesTransferred == s.totalBytes;
  }

  //upload file(s) from web
  uploadToFirebaseWeb(f, aF) {
    const path = aF + f.file.name;
    const ref = this.storage.ref(path);

    this.isOn = true;
    this.task = this.storage.upload(path, f.file);

    this.uid = this.auth.getCurrentUsedId();

    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      tap(console.log),
      finalize( async() => {
        this.downloadURL = await ref.getDownloadURL().toPromise();
        this.db.collection('files').add({
          uid: this.uid,
          name: f.file.name,
          isPublic: false,
          downloadURL: this.downloadURL
        });
      }),
    );
  }

  uploadBlobToFirebaseWeb(blob: Blob, location: string, index: number, name: string) {
    const path = location + '/$' + index + '$' + name;
    const ref = this.storage.ref(path);

    this.isOn = true;
    this.task = this.storage.upload(path, blob);

    this.uid = this.auth.getCurrentUsedId();

    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      tap(console.log),
      finalize( async() => {
        this.downloadURL = await ref.getDownloadURL().toPromise();
        this.db.collection('files').add({
          uid: this.uid,
          name: name,
          isPublic: false,
          downloadURL: this.downloadURL
        });
      }),
    );
  }

  //upload file from native app
  async chooseFile(aF) {
    this.fileChooser.open().then(async uri => {
      this.filePath.resolveNativePath(uri).then(async res => {
        const fileBlob = await this.makeFileIntoBlob(res);
        this.uploadToFirebase(fileBlob, aF);
      });
    }).catch((error) => console.log(error));
  }

  async choosePhoto(uid) {
    this.fileChooser.open({'mime': 'image/jpeg'}).then(uri => {
      this.filePath.resolveNativePath(uri).then(async newRes => {
        const fileBlob = await this.makeFileIntoBlob(newRes);
        await this.uploadToFirebasePhoto(fileBlob, uid);
      });
    }).catch((error) => console.log(error));
  }

  async uploadToFirebasePhoto(f, uid) {
    const path = '/profilePics/' + uid + '.jpg';
    const ref = this.storage.ref(path);

    this.storage.upload(path, f.imgBlob);
    this.downloadURL = await ref.getDownloadURL().toString();

    this.db.doc(`profile/${uid}`).set({
      photoURL: await this.downloadURL
    });
  }

  async uploadToFirebasePhotoWeb(f, uid) {
    const path = '/profilePics/' + uid + '.jpg';
    const ref = this.storage.ref(path);

    this.storage.upload(path, f);
    await ref.getDownloadURL().subscribe(res => {
      this.db.doc(`profile/${uid}`).update({
        photoURL: res.toString()
      })
    });
  }

  uploadToFirebase(f, aF) {
    const path = aF + f.fileName;
    const ref = this.storage.ref(path);

    this.task = this.storage.upload(path, f.imgBlob);
    this.isOn = true;
    this.uid = this.auth.getCurrentUsedId();

    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      tap(console.log),
      finalize( async() => {
        this.downloadURL = await ref.getDownloadURL().toPromise();
        this.db.collection('files').add({
          uid: this.uid,
          name: f.file.name,
          isPublic: false,
          downloadURL: this.downloadURL
        });
      }),
    );
  }

  /*uploadBlobToFirebase(f, aF) {
    this.uid = this.auth.getCurrentUsedId();
    this.isOn = true;
    let index = 0;

    this.chunkService.calculateSize(f).then(res => {
      res.forEach(chunk => {
        let path = location + '/$' + index + '$' + name;
        let uint8 = new Uint8Array(chunk);
        let blob = new Blob([uint8.buffer]);

        this.currentTask = this.storage.upload(path, chunk);
        index++;
      });
    });
  }*/

  makeFileIntoBlob(_filePath) {
    return new Promise((resolve, reject) => {
      let fileName = "";
      let fileType = "";
      this.file
        .resolveLocalFilesystemUrl(_filePath).then(fileEntry => {
          let { name, nativeURL } = fileEntry;
          let path = nativeURL.substring(0, nativeURL.lastIndexOf("/"));
          fileName = name;
          fileType = this.getFileType(name);

          return this.file.readAsArrayBuffer(path, name);
        })
        .then(buffer => {
          let fileBlob = new Blob([buffer], {
            type: fileType
          });
          resolve({fileName, fileBlob});
        })
        .catch(e => console.log(e));
    });
  }

  getFileType(n) {
    let t = n.substring(n.lastIndexOf(".")+1, n.length);
    let type = "";

    if(t === "jpg" || t === "JPG" || t === "jpeg" || t === "JPEG") type = "image/jpeg";
    else if(t === "png" || t === "PNG") type = "image/png";
    else if(t === "avi" || t === "AVI") type = "video/x-msvideo";
    else if(t === "doc" || t === "DOC") type = "application/msword";
    else if(t === "docx" || t === "DOCX") type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if(t === "gz" || t === "GZ") type = "application/gzip";
    else if(t === "gif" || t === "GIF") type = "image/gif";
    else if(t === "htm" || t === "HTM" || t === "html" || t === "HTML") type = "test/html";
    else if(t === "ico" || t === "ICO") type = "image/vnd.microsoft.icon";
    else if(t === "jar" || t === "JAR") type = "application/java-archive";
    else if(t === "json" || t === "JSON") type = "application/json";
    else if(t === "mp3" || t === "MP3") type = "audio/mpeg";
    else if(t === "mp4" || t === "MP4") type = "video/mp4";
    else if(t === "mpeg" || t === "MPEG") type = "video/mpeg";
    else if(t === "odp" || t === "ODP") type = "application/vnd.oasis.opendocument.presentation";
    else if(t === "ods" || t === "ODS") type = "application/vnd.oasis.opendocument.spreadsheet";
    else if(t === "odt" || t === "ODT") type = "application/vnd.oasis.opendocument.text";
    else if(t === "pdf" || t === "PDF") type = "application/pdf";
    else if(t === "ppt" || t === "PPT") type = "application/vnd.ms-powerpoint";
    else if(t === "pptx" || t === "PPTX") type = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    else if(t === "rar" || t === "RAR") type = "application/vnd.rar";
    else if(t === "txt" || t === "TXT") type = "text/plain";
    else if(t === "xhtml" || t === "XHTML") type = "applicatin/xhtml-xml";
    else if(t === "wav" || t === "WAV") type = "video/wav";
    else if(t === "xls" || t === "XLS") type = "application/vnd.ms-excel";
    else if(t === "xlsx" || t === "XLSX") type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    else if(t === "zip" || t === "ZIP") type = "application/zip";
    else if(t === "7z" || t === "7Z") type = "application/x-7z-compressed";
    else type = "unknown";

    return type;
  }
}
