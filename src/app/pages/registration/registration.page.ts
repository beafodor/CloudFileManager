import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-regist',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  validationMessage = {
    username: [
      {type:"required", message:"Please Enter Your Username!"}
    ],
    email: [
      {type:"required", message:"Please Enter Your Email!"},
      {type:"pattern", message:"This Email Is Incorrect. Please Enter A Valid Email!"}
    ],
    password: [
      {type:"required", message:"Please Enter Your Password!"},
      {type:"minlength", message:"Your Password must be at least 6 characters!"}
    ],
    cpassword: [
      {type:"required", message:"Please Enter Your Password Again!"}
    ]
  }

  validationFU: FormGroup;
  loading: any;

  constructor(
    public fbAuth: AngularFireAuth,
    private router: Router,
    public auth: AuthService,
    public loginService: LoginService,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
    ) {
      this.loading = this.loadingCtrl;
    }

  ngOnInit() {
    this.validationFU = this.formBuilder.group({
      username: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])),
      cpassword: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ]))
    })
  }

  signup(u) {
    this.showAlert();
    try {
      this.auth.signUp(u).then( res => {
        console.log(res);
        if(res.user) {
          res.user.updateProfile({
            displayName: u.username,
            email: u.email
          });
          this.loading.dismiss();
          this.router.navigate(['login']);
        }
      }, err => {
        this.loading.dismiss();
        this.errLoading(err.message);
      });
    } catch (error) {
      console.log(error)
    }
  }

  async showAlert() {
    var load = await this.loadingCtrl.create({
      message: "Please wait..."
    })
    load.present();
  }

  async errLoading(message: any) {
    const loading = await this.alertCtrl.create({
      header: "Error in signing up",
      message: message,
      buttons: [{
        text: 'ok',
        handler: () => {
          this.router.navigate(['registration'])
        }
      }]
    })
    await loading.present();
  }
}
