import { Component } from '@angular/core';


@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  isModalOpen = false;

  abrirModal():void {
    this.isModalOpen = true;
  }

  fecharModal():void {
    this.isModalOpen = false;
  }
}
