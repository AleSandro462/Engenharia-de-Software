export interface Animal {
  id: number;
  nome: string;
  especie: string;
  raca?: string | null;
  sexo?: string;
  data_nascimento?: string | null; // 'YYYY-MM-DD'
}

export interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string | null;
  animais: Animal[];
}