import { Routes } from '@angular/router';
import { Financeiro } from './sessoes/financeiro/financeiro';
import { Dashboard } from './sessoes/dashboard/dashboard';
import { Agenda} from './sessoes/agenda/agenda';
import { Atendimentos } from './sessoes/atendimentos/atendimentos';
import { Prontuarios } from './sessoes/prontuarios/prontuarios';
import { Relatorios } from './sessoes/relatorios/relatorios';
import { Tutores } from './sessoes/tutores/tutores';
import { Usuarios } from './sessoes/usuarios/usuarios';

export const routes: Routes = [
 {path: "", redirectTo: 'dashboard', pathMatch: 'full'},

 {path:'dashboard', component: Dashboard},
 {path: 'financeiro', component: Financeiro},
 {path: 'agenda', component: Agenda},
 {path: 'atendimentos', component: Atendimentos},
 {path: 'prontuarios', component: Prontuarios},
 {path: 'relatorios', component: Relatorios},
 {path: 'tutores', component: Tutores},
 {path: 'usuarios', component: Usuarios}
];
