export interface Professor {
  id: string;
  nome: string;
  cpf: string;
  endereco: string;
  bairro: string;
  cidadeUf: string;
  cep: string;
  telefone: string;
  email: string;
  dadosBancarios?: string;
  observacoes?: string;
  
  // Custom design requirements & Excel export fields
  whatsapp?: string;
  aniversario?: string; // Dia/Mês
  congregacao?: string;
  nivelFormacao?: string;
  nomeCurso?: string;
  instituicaoFormacao?: string;
  anoConclusao?: string;
  chavePix?: string;
  banco?: string;
  tipoConta?: string;
  operacao?: string;
  agencia?: string;
  conta?: string;
}

export interface Nucleo {
  id: string;
  nome: string;
  curso: string;
  cidade: string;
  coordenador: string;
  observacoes?: string;
}

export interface ConfiguracoesEscola {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  logoUrl?: string; // base64 ou URL
  textoPadrao: string;
}

export interface Recibo {
  id: string;
  idProfessor: string;
  nomeProfessor: string;
  cpfProfessor: string;
  enderecoProfessor: string;
  idNucleo: string;
  nomeNucleo: string;
  cursoNucleo: string;
  data: string;
  valor: number;
  valorExtenso: string;
  referente: string;
  duasVias: boolean;
  dataCriacao: string;
  template?: "docente" | "coordenador_secretario";
  disciplina?: string;
}
