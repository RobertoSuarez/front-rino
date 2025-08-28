import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';
import { guestGuard } from '../../core/guards';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login, canActivate: [() => guestGuard()] },
    { path: 'register', component: Register, canActivate: [() => guestGuard()] }
] as Routes;
