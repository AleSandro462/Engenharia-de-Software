import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { Cadastro } from './pages/cadastro/cadastro';
import { Agenda } from './sessoes/agenda/agenda';
import { Atendimentos } from './sessoes/atendimentos/atendimentos';
import { Dashboard } from './sessoes/dashboard/dashboard';
import { Financeiro } from './sessoes/financeiro/financeiro';
import { Prontuarios } from './sessoes/prontuarios/prontuarios';
import { Relatorios } from './sessoes/relatorios/relatorios';
import { Tutores } from './sessoes/tutores/tutores';
import { Usuarios } from './sessoes/usuarios/usuarios';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 1. Tela de Login isolada (sem sidebar e sem header)
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: Cadastro },
  // 2. Módulos internos encapsulados no Layout Principal
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'financeiro', component: Financeiro },
      { path: 'agenda', component: Agenda },
      { path: 'atendimentos', component: Atendimentos },
      { path: 'prontuarios', component: Prontuarios },
      { path: 'relatorios', component: Relatorios },
      { path: 'tutores', component: Tutores },
      { path: 'usuarios', component: Usuarios },
    ],
  },

  { path: '**', redirectTo: 'login' },
];