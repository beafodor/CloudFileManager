import { Injectable } from '@angular/core';
import { Users } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

    // Set data on localStorage
    setUserLoggedIn(user: Users) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('saved on localStorage');
    }

    // get data on localStorage
    getUserLoggedIn() {
      if (localStorage.getItem('user')) {
        JSON.parse(localStorage.getItem('user'));
      } else {
        console.log('localStorage empty');
      }
    }

    // Optional: clear localStorage
    clearLocalStorage() {
      localStorage.clear();
    }
}
