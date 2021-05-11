import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { LoginService } from 'src/app/services/login/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //input field validation messages
  validationMessage = {
    email: [
      {type:"required", message:"Please Enter Your Email!"},
      {type:"pattern", message:"This Email Is Incorrect. Please Enter A Valid Email!"}
    ],
    password: [
      {type:"required", message:"Please Enter Your Password!"}
    ]
  }

  validationFU: FormGroup;
  email: string = "";
  password: string = "";

  constructor(
    private formBuilder: FormBuilder,
    public loginService: LoginService,
    ) { }

  ngOnInit() {
    //input field validation
    this.validationFU = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ]))
    })
  }


  async clickLogin(user) {
    await this.loginService.login(user);
  }

  async clickGoogle() {
    await this.loginService.GoogleLogin();
  }
}
