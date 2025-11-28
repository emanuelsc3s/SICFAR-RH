/**
 * Tipos para funcionalidade de rede social de aniversariantes
 */

export interface BirthdayPerson {
  name: string;
  department: string;
  date: string;
  avatar?: string;
  admissionDate: string;
  birthDate: string;
  matricula?: string;
}

export interface CurtidaAniversario {
  id: string;
  funcionarioMatricula: string;
  autorMatricula: string;
  ano: number;
  createdAt: string;
}

export interface ComentarioAniversario {
  id: string;
  funcionarioMatricula: string;
  autorMatricula: string;
  autorNome: string;
  autorAvatar?: string;
  mensagem: string;
  ano: number;
  createdAt: string;
  updatedAt: string;
}

export interface NovoComentario {
  funcionarioMatricula: string;
  autorMatricula: string;
  autorNome: string;
  autorAvatar?: string;
  mensagem: string;
}

export interface CurrentUser {
  matricula: string;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  loginTimestamp: string;
}

