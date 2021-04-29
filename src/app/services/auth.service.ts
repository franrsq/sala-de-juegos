import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private afDb: AngularFireDatabase, private router: Router,
    private ngZone: NgZone) {

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

  googleAuth() {
    return this.authLogin(new firebase.auth.GoogleAuthProvider());
  }

  authLogin(provider) {
    return this.afAuth.signInWithPopup(provider);
  }

  async saveNickname(nickname: string) {
    this.saveNickName(nickname, (await this.getUser()).uid);
  }

  private saveNickName(nickname: string, uid: string) {
    return this.afDb.object(`users/${uid}`).set({
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
    return this.afAuth.signOut();
  }
}
