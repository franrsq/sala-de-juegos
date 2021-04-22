import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  validationMessages = {
    nickname: [{ type: "required", message: "nicknameRequired" }],
    email: [
      { type: "required", message: "emailRequired" },
      { type: "pattern", message: "invalidEmail" }
    ],
    password: [
      { type: "required", message: "passwordRequired" },
      { type: "minlength", message: "passwordMinLength" }
    ]
  }

  signUpForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private router: Router, private toastController: ToastController) { }

  ngOnInit() {
    this.signUpForm = this.formBuilder.group({
      nickname: new FormControl('', Validators.compose([
        Validators.required
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ]))
    });
  }

  registerUser(data) {
    this.authService.signUp(data.nickname, data.email, data.password)
      .then(async () => {
        const toast = await this.toastController.create({
          message: 'Registro realizado exitosamente',
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      })
      .catch(async (error) => {
        const toast = await this.toastController.create({
          message: 'Hubo un error durante el registro',
          duration: 2000,
          color: "danger"
        });
        toast.present();
      });
  }

  loginGoogle() {
    this.authService.googleAuth()
      .then(async () => {
        const toast = await this.toastController.create({
          message: 'Inicio de sesión exitoso',
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/home', { replaceUrl: true });
      })
      .catch(async (error) => {
        const toast = await this.toastController.create({
          message: 'Hubo un error al iniciar sesión',
          duration: 2000,
          color: "danger"
        });
        toast.present();
      });
  }

}
