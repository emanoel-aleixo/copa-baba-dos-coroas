// ============================================================
// II COPA BABA DOS COROAS — Dados do torneio
// MODO DEMONSTRAÇÃO: times, jogadores e resultados de exemplo
// (o sorteio oficial define as seleções reais).
// FORMATO: 5 seleções, todos contra todos (pontos corridos).
// 1º × 2º fazem a FINAL · 3º × 4º disputam o 3º lugar · 5º eliminado.
// ============================================================

const COPA = {
  nome: 'II Copa Baba dos Coroas',
  tema: 'Edição Copa do Mundo',
  local: 'Canindé de São Francisco/SE',
  inicio: '2026-08-30T09:00:00-03:00',
  whatsappFotos: '5579999111241',
  precoFoto: 'R$ 5,00',
  demo: true,
};

// --- Seleções -------------------------------------------------
const SELECOES = [
  {
    id: 'brasil', nome: 'Brasil', bandeira: '🇧🇷', cor: '#FFDF00', cor2: '#009C3B',
    confirmada: true,
    historia: 'A seleção canarinho do baba. Fundada pelos coroas mais antigos do grupo, promete jogo bonito e resenha garantida no terceiro tempo.',
    elenco: [
      { n: 1, nome: 'Careca', pos: 'GOL' }, { n: 2, nome: 'Zé da Van', pos: 'FIX' },
      { n: 5, nome: 'Bigode', pos: 'ALA' }, { n: 7, nome: 'Neguinho', pos: 'ALA' },
      { n: 9, nome: 'Galego', pos: 'PIV' }, { n: 10, nome: 'Mestre Dão', pos: 'PIV' },
      { n: 11, nome: 'Serginho', pos: 'ALA' },
    ],
  },
  {
    id: 'noruega', nome: 'Noruega', bandeira: '🇳🇴', cor: '#EF2B2D', cor2: '#002868',
    confirmada: true,
    historia: 'Os vikings do sertão! Frios no começo, mas quando esquentam viram avalanche. Prometem faro de gol de norte a sul do campo.',
    elenco: [
      { n: 1, nome: 'Muralha', pos: 'GOL' }, { n: 3, nome: 'Tonho', pos: 'FIX' },
      { n: 6, nome: 'Cabeça', pos: 'ALA' }, { n: 8, nome: 'Russo', pos: 'ALA' },
      { n: 9, nome: 'Viking', pos: 'PIV' }, { n: 10, nome: 'Dedé', pos: 'PIV' },
      { n: 11, nome: 'Loiro', pos: 'ALA' },
    ],
  },
  {
    id: 'vaga3', nome: 'A definir', bandeira: '❔', cor: '#555b74', cor2: '#2a2f45',
    confirmada: false,
    historia: 'Vaga aguardando o sorteio das próximas seleções. Em breve mais um adversário entra na dança!',
    elenco: [],
  },
  {
    id: 'vaga4', nome: 'A definir', bandeira: '❔', cor: '#555b74', cor2: '#2a2f45',
    confirmada: false,
    historia: 'Vaga aguardando o sorteio das próximas seleções. Em breve mais um adversário entra na dança!',
    elenco: [],
  },
  {
    id: 'vaga5', nome: 'A definir', bandeira: '❔', cor: '#555b74', cor2: '#2a2f45',
    confirmada: false,
    historia: 'Vaga aguardando o sorteio das próximas seleções. Em breve mais um adversário entra na dança!',
    elenco: [],
  },
];

// --- Jogos ----------------------------------------------------
// Todos contra todos em 5 rodadas (uma seleção folga por rodada).
// placar: null = ainda não jogado
const JOGOS = [
  // Rodízio (todos contra todos, 1 folga por rodada). Placares em branco:
  // o admin lança pelo painel e o app atualiza sozinho.
  // RODADA 1 — 30/08 — ABERTURA: Brasil × Noruega! (folga: vaga5)
  { id: 1, rodada: 1, fase: 'Pontos Corridos', data: '2026-08-30T09:00:00-03:00', casa: 'brasil', fora: 'noruega', placar: null },
  { id: 2, rodada: 1, fase: 'Pontos Corridos', data: '2026-08-30T10:00:00-03:00', casa: 'vaga3', fora: 'vaga4', placar: null },

  // RODADA 2 — 06/09 — folga: vaga4
  { id: 3, rodada: 2, fase: 'Pontos Corridos', data: '2026-09-06T09:00:00-03:00', casa: 'brasil', fora: 'vaga3', placar: null },
  { id: 4, rodada: 2, fase: 'Pontos Corridos', data: '2026-09-06T10:00:00-03:00', casa: 'noruega', fora: 'vaga5', placar: null },

  // RODADA 3 — 13/09 — folga: noruega
  { id: 5, rodada: 3, fase: 'Pontos Corridos', data: '2026-09-13T09:00:00-03:00', casa: 'brasil', fora: 'vaga4', placar: null },
  { id: 6, rodada: 3, fase: 'Pontos Corridos', data: '2026-09-13T10:00:00-03:00', casa: 'vaga3', fora: 'vaga5', placar: null },

  // RODADA 4 — 20/09 — folga: vaga3
  { id: 7, rodada: 4, fase: 'Pontos Corridos', data: '2026-09-20T09:00:00-03:00', casa: 'brasil', fora: 'vaga5', placar: null },
  { id: 8, rodada: 4, fase: 'Pontos Corridos', data: '2026-09-20T10:00:00-03:00', casa: 'noruega', fora: 'vaga4', placar: null },

  // RODADA 5 — 27/09 — folga: brasil
  { id: 9, rodada: 5, fase: 'Pontos Corridos', data: '2026-09-27T09:00:00-03:00', casa: 'noruega', fora: 'vaga3', placar: null },
  { id: 10, rodada: 5, fase: 'Pontos Corridos', data: '2026-09-27T10:00:00-03:00', casa: 'vaga4', fora: 'vaga5', placar: null },

  // FINAIS — 11/10
  { id: 11, rodada: 6, fase: 'Disputa 3º lugar', data: '2026-10-11T09:30:00-03:00', casa: null, fora: null, placar: null, desc: '3º colocado × 4º colocado' },
  { id: 12, rodada: 6, fase: 'GRANDE FINAL', data: '2026-10-11T11:00:00-03:00', casa: null, fora: null, placar: null, desc: '1º colocado × 2º colocado' },
];

// --- Fotos por jogo (venda com cadeado) ------------------------
// Preenchido após cada rodada. Ex. de estrutura (jogo = id do jogo):
//   { jogo: 1, titulo: 'Brasil × Noruega', fotos: [
//     { id: 'f1', liberada: false, legenda: 'Lance da partida', src: 'assets/fotos/f1.jpg' },
//   ]},
const FOTOS = [];

// --- Vídeos -----------------------------------------------------
const VIDEOS = [
  { titulo: 'Melhores momentos — Rodada 1', desc: 'Gols e lances da estreia', youtube: null },
  { titulo: 'Chamada oficial da II Copa', desc: 'Vem aí a maior copa de coroas do sertão', youtube: null },
];

// --- Patrocinadores ---------------------------------------------
const PATROCINADORES = [
  { nome: 'Seu Patrocínio Aqui', desc: 'Cota Ouro 🥇', destaque: true },
  { nome: 'Mercadinho do Povo', desc: 'Apoio' },
  { nome: 'Bar do Careca', desc: 'O terceiro tempo é aqui' },
  { nome: 'Auto Peças Canindé', desc: 'Apoio' },
];
