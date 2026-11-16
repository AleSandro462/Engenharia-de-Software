export interface Animal {
  id: number;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: 'M' | 'F';
  data_nascimento: string | null;
}

export interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  animais: Animal[];
}

export type TutorDados = Omit<Tutor, 'id' | 'animais'>;
export type AnimalDados = Omit<Animal, 'id'>;
