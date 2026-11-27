import { perfilGuard } from './guards/perfil.guard';
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
import { Veterinarios } from './sessoes/veterinarios/veterinarios';
import { RecuperarSenha } from './pages/recuperar-senha/recuperar-senha';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 1. Tela de Login isolada (sem sidebar e sem header)
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: Cadastro },
  { path: 'recuperar-senha', component: RecuperarSenha },
  // 2. Módulos internos encapsulados no Layout Principal
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard',    component: Dashboard,    canActivate: [perfilGuard('dashboard')] },
      { path: 'agenda',       component: Agenda,       canActivate: [perfilGuard('agenda')] },
      { path: 'tutores',      component: Tutores,      canActivate: [perfilGuard('tutores')] },
      { path: 'atendimentos', component: Atendimentos, canActivate: [perfilGuard('atendimentos')] },
      { path: 'prontuarios',  component: Prontuarios,  canActivate: [perfilGuard('prontuarios')] },
      { path: 'financeiro',   component: Financeiro,   canActivate: [perfilGuard('financeiro')] },
      { path: 'relatorios',   component: Relatorios,   canActivate: [perfilGuard('relatorios')] },
      { path: 'usuarios',     component: Usuarios,     canActivate: [perfilGuard('usuarios')] },
      { path: 'veterinarios', component: Veterinarios, canActivate: [perfilGuard('veterinarios')] },
      
    ],
  },

  { path: '**', redirectTo: 'login' },
];