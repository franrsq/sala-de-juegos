import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';
import { Router } from '@angular/router';

export interface User {
  uid: string;
  email: string;
  nickname: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User;
  nickNameSubscription: Subscription;

  constructor(private afAuth: AngularFireAuth, private afDb: AngularFireDatabase, private router: Router) {
    this.afAuth.onAuthStateChanged((user) => {
      // User sign out
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.currentUser = {
        uid: user.uid,
        email: user.email,
        nickname: null
      }
      this.nickNameSubscription = this.afDb.object('users/' + user.uid)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            this.currentUser['nickname'] = data.nickname;
            localStorage.setItem('uid', JSON.stringify(this.currentUser.uid));
            localStorage.setItem('nickname', JSON.stringify(data));
          } else {
            localStorage.setItem('uid', null);
            localStorage.setItem('nickname', null);
          }
        });
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

  saveNickname(nickname: string) {
    this.saveNickName(nickname, this.currentUser.uid);
  }

  private saveNickName(nickname: string, uid: string) {
    return this.afDb.object(`users/${uid}`).set({
      nickname: nickname
    });
  }

  signOut() {
    return this.afAuth.signOut();
  }
}
