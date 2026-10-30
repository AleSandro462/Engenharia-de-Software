import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
// 1. Importe os componentes da Sidebar e do Header (ajuste os caminhos conforme a estrutura das suas pastas)

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar, // 2. Adicione a Sidebar aqui
    Header   // 3. Adicione o Header aqui
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {}