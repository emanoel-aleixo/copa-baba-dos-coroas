// ============================================================
// II COPA BABA DOS COROAS — Dados do torneio
// SELEÇÕES OFICIAIS (sorteadas): Brasil, Noruega, França, Uruguai, Portugal.
// Elencos ainda com apelidos de exemplo — trocar pelos jogadores reais.
// Placares em branco: o admin lança pelo painel (admin.html).
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
      { n: 2, nome: 'Mardoka La', pos: 'GOL' }, { n: 3, nome: 'Naná' },
      { n: 10, nome: 'Emanoel Aleixo' }, { n: 11, nome: 'Nilton' },
      { n: 13, nome: 'Geo Cruz' }, { n: 14, nome: 'Pezão' },
      { n: 19, nome: 'Fábio Nunes' }, { n: 22, nome: 'Ramigol' },
      { n: 58, nome: 'Deliano' },
    ],
  },
  {
    id: 'noruega', nome: 'Noruega', bandeira: '🇳🇴', cor: '#EF2B2D', cor2: '#002868',
    confirmada: true,
    historia: 'Os vikings do sertão! Frios no começo, mas quando esquentam viram avalanche. Prometem faro de gol de norte a sul do campo.',
    elenco: [
      { n: 3, nome: 'França' }, { n: 5, nome: 'Fabio Phillype' },
      { n: 10, nome: 'M. Cabral' }, { n: 15, nome: 'Galdene Souza', pos: 'GOL' },
      { n: 29, nome: 'Andrezinho' }, { n: 33, nome: 'Jackson' },
      { n: 40, nome: 'Darlan Galdino' }, { n: 70, nome: 'Eduardo Aleixo' },
      { n: 77, nome: 'Marcelo Paca' },
    ],
  },
  {
    id: 'franca', nome: 'França', bandeira: '🇫🇷', cor: '#0055A4', cor2: '#EF4135',
    confirmada: true,
    historia: 'Les bleus do São Francisco. Elegantes fora de campo, caçadores dentro dele. Prometem futebol de champagne no calor do sertão.',
    elenco: [
      { n: 2, nome: 'Eduardo', pos: 'GOL' }, { n: 4, nome: 'Henrique' },
      { n: 5, nome: 'Leonardo' }, { n: 7, nome: 'Silvan' },
      { n: 8, nome: 'Lueno Nascimento' }, { n: 9, nome: 'Cristiano' },
      { n: 10, nome: 'Bruno Rodrigo' }, { n: 11, nome: 'Elvis Neto' },
      { n: 13, nome: 'Clodoaldo' },
    ],
  },
  {
    id: 'uruguai', nome: 'Uruguai', bandeira: '🇺🇾', cor: '#7AB3E0', cor2: '#FCD116',
    confirmada: true,
    historia: 'A garra charrua do baba. Time de raça que não entrega um lance sequer — se tiver que sair mordendo, sai. Nunca dê a partida por perdida contra a celeste.',
    elenco: [
      { n: 1, nome: 'Guerra', pos: 'GOL' }, { n: 3, nome: 'Cebola', pos: 'FIX' },
      { n: 5, nome: 'Charrua', pos: 'ALA' }, { n: 7, nome: 'Nico', pos: 'ALA' },
      { n: 9, nome: 'Lobo', pos: 'PIV' }, { n: 10, nome: 'Pistola', pos: 'PIV' },
      { n: 11, nome: 'Xavier', pos: 'ALA' },
    ],
  },
  {
    id: 'portugal', nome: 'Portugal', bandeira: '🇵🇹', cor: '#FF0000', cor2: '#006600',
    confirmada: true,
    historia: 'Os lusitanos do baba. Todo mundo se acha o Cristiano Ronaldo na hora de bater falta — o fôlego é que às vezes só dura o primeiro tempo.',
    elenco: [
      { n: 1, nome: 'Gordinho', pos: 'GOL' }, { n: 3, nome: 'Naldo', pos: 'FIX' },
      { n: 5, nome: 'Peixe', pos: 'ALA' }, { n: 7, nome: 'Sivi', pos: 'ALA' },
      { n: 9, nome: 'Tico', pos: 'PIV' }, { n: 10, nome: 'Marreta', pos: 'PIV' },
      { n: 11, nome: 'Juninho', pos: 'ALA' },
    ],
  },
];

// --- Jogos ----------------------------------------------------
// Todos contra todos em 5 rodadas (uma seleção folga por rodada).
// placar: null = ainda não jogado
const JOGOS = [
  // Rodízio (todos contra todos, 1 folga por rodada). Placares em branco:
  // o admin lança pelo painel e o app atualiza sozinho.
  // RODADA 1 — 30/08 — ABERTURA: Brasil × Noruega! (folga: Portugal)
  { id: 1, rodada: 1, fase: 'Pontos Corridos', data: '2026-08-30T09:00:00-03:00', casa: 'brasil', fora: 'noruega', placar: null },
  { id: 2, rodada: 1, fase: 'Pontos Corridos', data: '2026-08-30T10:00:00-03:00', casa: 'franca', fora: 'uruguai', placar: null },

  // RODADA 2 — 06/09 — folga: Uruguai
  { id: 3, rodada: 2, fase: 'Pontos Corridos', data: '2026-09-06T09:00:00-03:00', casa: 'brasil', fora: 'franca', placar: null },
  { id: 4, rodada: 2, fase: 'Pontos Corridos', data: '2026-09-06T10:00:00-03:00', casa: 'noruega', fora: 'portugal', placar: null },

  // RODADA 3 — 13/09 — folga: Noruega
  { id: 5, rodada: 3, fase: 'Pontos Corridos', data: '2026-09-13T09:00:00-03:00', casa: 'brasil', fora: 'uruguai', placar: null },
  { id: 6, rodada: 3, fase: 'Pontos Corridos', data: '2026-09-13T10:00:00-03:00', casa: 'franca', fora: 'portugal', placar: null },

  // RODADA 4 — 20/09 — folga: França
  { id: 7, rodada: 4, fase: 'Pontos Corridos', data: '2026-09-20T09:00:00-03:00', casa: 'brasil', fora: 'portugal', placar: null },
  { id: 8, rodada: 4, fase: 'Pontos Corridos', data: '2026-09-20T10:00:00-03:00', casa: 'noruega', fora: 'uruguai', placar: null },

  // RODADA 5 — 27/09 — folga: Brasil
  { id: 9, rodada: 5, fase: 'Pontos Corridos', data: '2026-09-27T09:00:00-03:00', casa: 'noruega', fora: 'franca', placar: null },
  { id: 10, rodada: 5, fase: 'Pontos Corridos', data: '2026-09-27T10:00:00-03:00', casa: 'uruguai', fora: 'portugal', placar: null },

  // FINAIS — 11/10
  { id: 11, rodada: 6, fase: 'Disputa 3º lugar', data: '2026-10-11T09:30:00-03:00', casa: null, fora: null, placar: null, desc: '3º colocado × 4º colocado' },
  { id: 12, rodada: 6, fase: 'GRANDE FINAL', data: '2026-10-11T11:00:00-03:00', casa: null, fora: null, placar: null, desc: '1º colocado × 2º colocado' },
];

// --- Fotos por jogo (venda com cadeado) ------------------------
// Preenchido após cada rodada. Ex. de estrutura (jogo = id do jogo):
//   { jogo: 1, titulo: 'Brasil × Noruega', fotos: [
//     { id: 'f1', liberada: false, legenda: 'Lance da partida', src: 'assets/fotos/f1.jpg' },
//   ]},
const FOTOS = [
  { jogo: 1, titulo: 'Exemplo — assim ficarão as fotos de cada jogo', fotos: [
    { id: 'ex1', liberada: true, legenda: 'Amostra grátis' },
    { id: 'ex2', liberada: false, legenda: 'Comemoração da torcida' },
    { id: 'ex3', liberada: false, legenda: 'Lance da partida' },
    { id: 'ex4', liberada: false, legenda: 'Foto oficial das equipes' },
    { id: 'ex5', liberada: false, legenda: 'Defesa do goleiro' },
    { id: 'ex6', liberada: false, legenda: 'Resenha pós-jogo' },
  ]},
];

// --- Vídeos -----------------------------------------------------
const VIDEOS = [
  { titulo: 'Melhores momentos — Rodada 1', desc: 'Gols e lances da estreia', youtube: null },
  { titulo: 'Chamada oficial da II Copa', desc: 'Vem aí a maior copa de coroas do sertão', youtube: null },
];

// --- Patrocinadores ---------------------------------------------
const PATROCINADORES = [
  { nome: 'Prefeitura de Canindé de São Francisco', desc: 'Apoio institucional', logo: 'assets/patrocinadores/prefeitura.png' },
  { nome: 'Miltinho', desc: 'Patrocinador', logo: 'assets/patrocinadores/miltinho.png' },
];
