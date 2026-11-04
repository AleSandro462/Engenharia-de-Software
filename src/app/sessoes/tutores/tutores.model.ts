export interface Animal {
  id: number;
  nome: string;
  especie: string;
}

export interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  animais: Animal[];
}