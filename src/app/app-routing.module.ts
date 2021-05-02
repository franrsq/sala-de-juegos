import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

// Send unauthorized users to login
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/']);

// Automatically log in users
const redirectLoggedToHome = () => redirectLoggedInTo(['/home']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    ...canActivate(redirectLoggedToHome),
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./pages/sign-up/sign-up.module').then(m => m.SignUpPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'game-board/:roomId/:gameId/:rows/:cols',
    loadChildren: () => import('./pages/game-board/game-board.module').then(m => m.GameBoardPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'room/:roomId',
    loadChildren: () => import('./pages/room/room.module').then( m => m.RoomPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'new-game',
    loadChildren: () => import('./modals/new-game/new-game.module').then( m => m.NewGamePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'room-members',
    loadChildren: () => import('./modals/room-members/room-members.module').then( m => m.RoomMembersPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
