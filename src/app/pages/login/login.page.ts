import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  validationUserMessage = {
    email: [
      { type: "required", message: "emailRequired" },
      { type: "pattern", message: "invalidEmail" }
    ],
    password: [
      { type: "required", message: "passwordRequired" },
      { type: "minlength", message: "passwordMinLength" }
    ]
  }

  formLogin: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private toastController: ToastController, private router: Router) { }

  ngOnInit() {
    this.formLogin = this.formBuilder.group({
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

  login(data) {
    this.authService.signIn(data.email, data.password)
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
        this.router.navigate(['/home']);
      });
  }

  loginGoogle() {
    this.authService.GoogleAuth()
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
