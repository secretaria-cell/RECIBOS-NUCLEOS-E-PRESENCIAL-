import { Professor, Nucleo, ConfiguracoesEscola, Recibo } from "./types";

export function numeroParaExtenso(valor: number): string {
  if (valor <= 0) return "zero reais";

  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  function escreverTresAlgarismos(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";

    const c = Math.floor(n / 100);
    const rest = n % 100;
    const d = Math.floor(rest / 10);
    const u = rest % 10;

    let s = centenas[c];

    if (rest > 0) {
      if (s !== "") s += " e ";
      if (rest >= 10 && rest < 20) {
        s += especiais[rest - 10];
      } else {
        if (d > 0) {
          s += dezenas[d];
          if (u > 0) s += " e " + unidades[u];
        } else if (u > 0) {
          s += unidades[u];
        }
      }
    }
    return s;
  }

  const parts = valor.toFixed(2).split(".");
  const inteiro = parseInt(parts[0], 10);
  const centavos = parseInt(parts[1], 10);

  let extInteiro = "";

  if (inteiro > 0) {
    const grupos: number[] = [];
    let temp = inteiro;
    while (temp > 0) {
      grupos.push(temp % 1000);
      temp = Math.floor(temp / 1000);
    }

    const nomesSingular = ["real", "mil", "milhão", "bilhão"];
    const nomesPlural = ["reais", "mil", "milhões", "bilhões"];

    const partesEscritas: string[] = [];

    for (let i = 0; i < grupos.length; i++) {
      const g = grupos[i];
      if (g === 0) continue;

      let nomeG = "";
      if (i === 0) {
        nomeG = "";
      } else {
        if (g === 1) {
          nomeG = nomesSingular[i];
        } else {
          nomeG = nomesPlural[i];
        }
      }

      let esc = escreverTresAlgarismos(g);
      if (i === 1 && g === 1) {
        esc = "mil";
        nomeG = "";
      } else if (nomeG !== "") {
        esc += " " + nomeG;
      }

      partesEscritas.unshift(esc);
    }

    if (partesEscritas.length > 1) {
      const ultGrupo = grupos[0];
      if (ultGrupo > 0) {
        if (ultGrupo < 100 || ultGrupo % 100 === 0) {
          const ult = partesEscritas.pop();
          extInteiro = partesEscritas.join(", ") + " e " + ult;
        } else {
          extInteiro = partesEscritas.join(", ");
        }
      } else {
        extInteiro = partesEscritas.join(", ");
      }
    } else {
      extInteiro = partesEscritas[0];
    }

    if (inteiro === 1) {
      extInteiro += " real";
    } else {
      if (inteiro >= 1000000 && inteiro % 1000000 === 0) {
        extInteiro += " de reais";
      } else {
        extInteiro += " reais";
      }
    }
  }

  let extCentavos = "";
  if (centavos > 0) {
    if (centavos === 1) {
      extCentavos = "um centavo";
    } else {
      if (centavos >= 10 && centavos < 20) {
        extCentavos = especiais[centavos - 10] + " centavos";
      } else {
        const d = Math.floor(centavos / 10);
        const u = centavos % 10;
        let s = "";
        if (d > 0) {
          s += dezenas[d];
          if (u > 0) s += " e " + unidades[u];
        } else {
          s += unidades[u];
        }
        extCentavos = s + " centavos";
      }
    }
  }

  if (extInteiro !== "" && extCentavos !== "") {
    return extInteiro + " e " + extCentavos;
  } else if (extInteiro !== "") {
    return extInteiro;
  } else if (extCentavos !== "") {
    return extCentavos;
  }
  return "zero reais";
}

// Default seed data
export const INITIAL_TEACHERS: Professor[] = [
  {
    id: "prof_1",
    nome: "Prof. Marcos Aurélio de Souza",
    cpf: "111.222.333-44",
    endereco: "Av. Prudente de Morais, 1200",
    bairro: "Tirol",
    cidadeUf: "Natal/RN",
    cep: "59020-000",
    telefone: "(84) 99888-7711",
    email: "marcos.aurelio@gmail.com",
    dadosBancarios: "Banco do Brasil - Ag: 3240-9 - CC: 45322-1",
    observacoes: "Professor de Teologia Sistemática e Grego Bíblico."
  },
  {
    id: "prof_2",
    nome: "Profa. Ana Beatriz Cavalcanti",
    cpf: "555.666.777-88",
    endereco: "Rua Jaguarari, 321",
    bairro: "Lagoa Nova",
    cidadeUf: "Natal/RN",
    cep: "59054-300",
    telefone: "(84) 99122-3344",
    email: "ana.beatriz@outlook.com",
    dadosBancarios: "Caixa Econômica - Ag: 0032 - Op: 013 - Poupança: 88721-0",
    observacoes: "Professora de História do Cristianismo."
  },
  {
    id: "prof_3",
    nome: "Prof. Paulo Roberto Santos",
    cpf: "999.888.777-66",
    endereco: "Rua Seridó, 45",
    bairro: "Petrópolis",
    cidadeUf: "Natal/RN",
    cep: "59020-010",
    telefone: "(84) 98765-4321",
    email: "paulo.roberto@esteadeb.org.br",
    dadosBancarios: "Banco Pix - Chave CPF: 999.888.777-66",
    observacoes: "Professor de Hermenêutica e Homilética."
  }
];

export const INITIAL_NUCLEI: Nucleo[] = [
  {
    id: "nuc_1",
    nome: "Soledade 2",
    curso: "Médio em Teologia",
    cidade: "Natal",
    coordenador: "Past. José Mendes",
    observacoes: "Aulas teóricas presenciais às terças e quintas-feiras."
  },
  {
    id: "nuc_2",
    nome: "Parnamirim Centro",
    curso: "Bacharelado em Teologia",
    cidade: "Parnamirim",
    coordenador: "Past. Roberto Alves",
    observacoes: "Curso avançado de teologia sistemática e eclesiologia."
  }
];

export const INITIAL_SCHOOL: ConfiguracoesEscola = {
  nome: "ESTEADEB – Escola Teológica das Assembleias de Deus no Brasil",
  cnpj: "40.800.393/0001-32",
  endereco: "R. Dr. Célso Ramalho, 70 - Lagoa Seca, Natal/RN, CEP: 59022-330",
  telefone: "(84) 2030-4038",
  email: "secretaria@esteadeb.org.br",
  textoPadrao: "aulas ministradas referente ao Curso [CURSO] no Núcleo [NUCLEO]."
};

export const INITIAL_RECEIPTS: Recibo[] = [
  {
    id: "rec_1",
    idProfessor: "prof_1",
    nomeProfessor: "Prof. Marcos Aurélio de Souza",
    cpfProfessor: "111.222.333-44",
    enderecoProfessor: "Av. Prudente de Morais, 1200, Tirol, Natal/RN",
    idNucleo: "nuc_1",
    nomeNucleo: "Soledade 2",
    cursoNucleo: "Médio em Teologia",
    data: "2026-06-01",
    valor: 450.00,
    valorExtenso: "quatrocentos e cinquenta reais",
    referente: "aulas ministradas sobre Introdução à Teologia - Médio em Teologia no núcleo supracitado",
    duasVias: true,
    dataCriacao: "2026-06-01T14:30:00.000Z"
  },
  {
    id: "rec_2",
    idProfessor: "prof_2",
    nomeProfessor: "Profa. Ana Beatriz Cavalcanti",
    cpfProfessor: "555.666.777-88",
    enderecoProfessor: "Rua Jaguarari, 321, Lagoa Nova, Natal/RN",
    idNucleo: "nuc_2",
    nomeNucleo: "Parnamirim Centro",
    cursoNucleo: "Bacharelado em Teologia",
    data: "2026-05-28",
    valor: 1200.00,
    valorExtenso: "mil duzentos reais",
    referente: "cocoordenação acadêmica e correção de monografias no núcleo supracitado",
    duasVias: true,
    dataCriacao: "2026-05-28T10:15:00.000Z"
  }
];

// Carregar ou inicializar do LocalStorage
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Erro ao ler do localStorage", error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Erro ao gravar no localStorage", error);
  }
}
