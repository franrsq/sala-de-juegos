import { Injectable, Injector, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import firebase from 'firebase/app';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { FirebaseService } from './firebase.service'
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private afDb: AngularFireDatabase,
    private router: Router, private ngZone: NgZone, private injector: Injector,
    private googlePlus: GooglePlus) {

    this.afAuth.onAuthStateChanged(async (user) => {
      // User sign out
      if (!user) {
        this.ngZone.run(() => {
          this.router.navigate(['/login']);
        });
        return;
      }
    });
  }

  signIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async signUp(nickname: string, email: string, password: string) {
    const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
    this.sendVerificationEmail();
    this.saveNickName(nickname, result.user.uid);
  }

  async sendVerificationEmail() {
    return (await this.afAuth.currentUser).sendEmailVerification();
  }

  forgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  async googleAuth() {
    if (Capacitor.isNative) {
      if (Capacitor.platform == 'android') {
        let params = {
          webClientId: '495515336571-0fg9m76nafktfj1b7uov0ro41cedqhps.apps.googleusercontent.com',
          offline: true
        };

        const { idToken, accessToken } = await this.googlePlus.login(params);
        const credential = accessToken ? firebase.auth.GoogleAuthProvider.credential(idToken, accessToken) :
          firebase.auth.GoogleAuthProvider.credential(idToken);
        return this.afAuth.signInWithCredential(credential);
      }
    }
    return this.authLogin(new firebase.auth.GoogleAuthProvider());
  }

  authLogin(provider) {
    return this.afAuth.signInWithPopup(provider);
  }

  async saveNickname(nickname: string) {
    this.saveNickName(nickname, (await this.getUser()).uid);
  }

  private saveNickName(nickname: string, uid: string) {
    return this.afDb.object(`users/${uid}`).update({
      nickname: nickname
    });
  }

  async getUser() {
    return await this.afAuth.currentUser;
  }

  async getUserNickname() {
    let user = await this.getUser();
    let nicknamePr: any = this.afDb.object('users/' + user.uid)
      .valueChanges()
      .pipe(take(1))
      .toPromise();
    return (await nicknamePr)?.nickname;
  }

  signOut() {
    const firebaseService = this.injector.get(FirebaseService);
    firebaseService.setPresence(false);
    return this.afAuth.signOut();
  }
}
