import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { File } from '@ionic-native/file/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ClipboardModule } from 'ngx-clipboard';

import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AuthService } from './services/auth/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from './guards/authGuard/auth.guard';
import { UploadService } from './services/upload/upload.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { ManageService } from './services/manage/manage.service';
import { LoginGuard } from './guards/loginGuard/login.guard';
import { LoginService } from './services/login/login.service';
import { PlatformService } from './services/platform/platform.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NotificationsService } from './services/notifications/notifications.service';

export const firebaseConfig = {
  apiKey: "AIzaSyCf2CTexFB3vSeKINeMjbWSmwCuseCQPMc",
  authDomain: "cloudfilemanagerapp.firebaseapp.com",
  projectId: "cloudfilemanagerapp",
  storageBucket: "cloudfilemanagerapp.appspot.com",
  messagingSenderId: "162689521172",
  appId: "1:162689521172:web:683f60203d9922059bb901",
  measurementId: "G-GRXGFG49C8"
};

@NgModule({
  declarations: [AppComponent, ToolbarComponent, SidebarComponent],
  entryComponents: [],
  imports: [BrowserModule, BrowserAnimationsModule, ToastrModule.forRoot(), IonicModule.forRoot(),
    HttpClientModule, AngularFireModule, AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule, AngularFireStorageModule, AngularFirestoreModule, FormsModule, ReactiveFormsModule, AppRoutingModule, ClipboardModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    InAppBrowser,
    AuthGuard,
    LoginGuard,
    LoginService,
    ManageService,
    UploadService,
    AuthService,
    PlatformService,
    FileChooser,
    FilePath,
    File,
    GooglePlus,
    Clipboard,
    FileTransfer,
    NativeStorage,
    NotificationsService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
