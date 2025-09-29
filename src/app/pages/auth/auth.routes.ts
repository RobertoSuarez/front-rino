import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';
import { ForgotPassword } from './forgot-password';
import { ResetPassword } from './reset-password';
import { VerifyEmail } from './verify-email';
import { guestGuard } from '../../core/guards';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login, canActivate: [() => guestGuard()] },
    { path: 'register', component: Register, canActivate: [() => guestGuard()] },
    { path: 'forgot-password', component: ForgotPassword, canActivate: [() => guestGuard()] },
    { path: 'reset-password', component: ResetPassword, canActivate: [() => guestGuard()] },
    { path: 'verify-email', component: VerifyEmail, canActivate: [() => guestGuard()] }
] as Routes;
