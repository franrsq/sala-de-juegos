import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  validationMessages = {
    email: [
      { type: "required", message: "emailRequired" },
      { type: "pattern", message: "invalidEmail" }
    ]
  }

  forgotPassForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private toastController: ToastController, private router: Router) { }

  ngOnInit() {
    this.forgotPassForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email
      ]))
    });
  }

  resetPassword(data) {
    this.authService.forgotPassword(data.email)
      .then(async () => {
        const toast = await this.toastController.create({
          message: 'Correo enviado exitosamente',
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      })
      .catch(async (error) => {
        const toast = await this.toastController.create({
          message: 'Hubo un error durante el envío del correo',
          duration: 2000,
          color: "danger"
        });
        toast.present();
      });
  }

}
