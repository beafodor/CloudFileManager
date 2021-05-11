import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(
    private platform: Platform
  ) { }

  getPlatformType() {
    if(this.platform.is("desktop") || this.platform.is("mobileweb")) return "desktop";
    else if (this.platform.is("android") || (this.platform.is("android") && this.platform.is("mobileweb"))) return "android";
    else return "unknown";
  }

  setPlatformType(p) {
    p = this.getPlatformType();
  }
}
