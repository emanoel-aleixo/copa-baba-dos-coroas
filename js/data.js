// ============================================================
// II COPA BABA DOS COROAS — Dados do torneio
// SELEÇÕES OFICIAIS (sorteadas): Brasil, Noruega, França, Argentina, Portugal.
// Elencos ainda com apelidos de exemplo — trocar pelos jogadores reais.
// Placares em branco: o admin lança pelo painel (admin.html).
// FORMATO: 5 seleções, todos contra todos (pontos corridos).
// 1º × 2º fazem a FINAL · 3º × 4º disputam o 3º lugar · 5º eliminado.
// ============================================================

const COPA = {
  nome: 'II Copa Baba dos Coroas',
  tema: 'Edição Copa do Mundo',
  local: 'Canindé de São Francisco/SE',
  inicio: '2026-08-30T06:00:00-03:00',
  whatsappFotos: '5579998777953',
  precoFoto: 'R$ 5,00',

  // --- Bolão pago (por jogo) ---
  // Cada palpite custa R$ 5. Quem acertar o PLACAR EXATO leva o bolo do jogo
  // (dividido se houver mais de um). Se ninguém acertar, ACUMULA pro próximo.
  bolaoValor: 5,
  bolaoWhatsapp: '5579998777953', // organização recebe os palpites/comprovantes
  pixChave: 'Nascimento_Lueno@hotmail.com', // chave Pix (e-mail) do caixa da Associação
  pixNome: 'Caixa da Associação Baba dos Coroas',

  demo: true,
};

// --- Seleções -------------------------------------------------
const SELECOES = [
  {
    id: 'noruega', nome: 'Noruega', bandeira: '🇳🇴', cor: '#EF2B2D', cor2: '#002868',
    confirmada: true,
    historia: 'Os vikings do sertão! Frios no começo, mas quando esquentam viram avalanche. Prometem faro de gol de norte a sul do campo.',
    elenco: [
      { n: 3, nome: 'Luas França', pos: 'ZAG', foto: 'assets/cards/noruega/luas-franca.jpg' },
      { n: 5, nome: 'Fábio Phillype', pos: 'ZAG', foto: 'assets/cards/noruega/fabio-phillype.jpg' },
      { n: 10, nome: 'Marcos Cabral', pos: 'ATA', foto: 'assets/cards/noruega/marcos-cabral.jpg' },
      { n: 15, nome: 'Galdene Souza', pos: 'GOL', foto: 'assets/cards/noruega/galdene.jpg' },
      { n: 29, nome: 'Andrezinho', pos: 'ZAG', foto: 'assets/cards/noruega/andrezinho.jpg' },
      { n: 33, nome: 'Jackson Miranda', pos: 'ALA', foto: 'assets/cards/noruega/jackson-miranda.jpg' },
      { n: 40, nome: 'Darlan Galdino', pos: 'LAT', foto: 'assets/cards/noruega/darlan-galdino.jpg' },
      { n: 70, nome: 'Eduardo Aleixo', pos: 'ZAG', foto: 'assets/cards/noruega/eduardo-aleixo.jpg' },
      { n: 77, nome: 'Marcelo Passos', pos: 'ATA', foto: 'assets/cards/noruega/marcelo-passos.jpg' },
    ],
  },
  {
    id: 'brasil', nome: 'Brasil', bandeira: '🇧🇷', cor: '#FFDF00', cor2: '#009C3B',
    confirmada: true,
    historia: 'A seleção canarinho do baba. Fundada pelos coroas mais antigos do grupo, promete jogo bonito e resenha garantida no terceiro tempo.',
    elenco: [
      { n: 2, nome: 'Mardoqueu', pos: 'GOL', foto: 'assets/cards/brasil/mardoqueu.jpg' },
      { n: 3, nome: 'Naná', pos: 'ZAG', foto: 'assets/cards/brasil/nana.jpg' },
      { n: 10, nome: 'Emanoel Aleixo', pos: 'MEI', foto: 'assets/cards/brasil/emanoel-aleixo.jpg' },
      { n: 11, nome: 'Nilton', pos: 'MEI', foto: 'assets/cards/brasil/nilton.jpg' },
      { n: 13, nome: 'Geo Cruz', pos: 'ZAG', foto: 'assets/cards/brasil/geo-cruz.jpg' },
      { n: 14, nome: 'Edilson Jr', pos: 'VOL', foto: 'assets/cards/brasil/edilson-jr.jpg' },
      { n: 19, nome: 'Fábio Nunes', pos: 'ATA', foto: 'assets/cards/brasil/fabio-nunes.jpg' },
      { n: 22, nome: 'Ramigol', pos: 'ATA', foto: 'assets/cards/brasil/ramigol.jpg' },
      { n: 58, nome: 'Deliano', pos: 'VOL', foto: 'assets/cards/brasil/deliano.jpg' },
    ],
  },
  {
    id: 'franca', nome: 'França', bandeira: '🇫🇷', cor: '#0055A4', cor2: '#EF4135',
    confirmada: true,
    historia: 'Les bleus do São Francisco. Elegantes fora de campo, caçadores dentro dele. Prometem futebol de champagne no calor do sertão.',
    elenco: [
      { n: 2, nome: 'Eduardo', pos: 'GOL', foto: 'assets/cards/franca/eduardo.jpg' },
      { n: 4, nome: 'Henrique Almeida', pos: 'ZAG', foto: 'assets/cards/franca/henrique.jpg' },
      { n: 5, nome: 'Leonardo Dantas', pos: 'MEI', foto: 'assets/cards/franca/leonardo.jpg' },
      { n: 7, nome: 'Silvan', pos: 'LAT', foto: 'assets/cards/franca/silvan.jpg' },
      { n: 8, nome: 'Lueno Nascimento', pos: 'VOL', foto: 'assets/cards/franca/lueno.jpg' },
      { n: 9, nome: 'Cristiano', pos: 'ATA', foto: 'assets/cards/franca/cristiano.jpg' },
      { n: 10, nome: 'Bruno Rodrigo', pos: 'MEI', foto: 'assets/cards/franca/bruno-rodrigo.jpg' },
      { n: 11, nome: 'Elvis Neto', pos: 'ATA', foto: 'assets/cards/franca/elvis-neto.jpg' },
      { n: 13, nome: 'Clodoaldo', pos: 'PIV', foto: 'assets/cards/franca/clodoaldo.jpg' },
    ],
  },
  {
    id: 'argentina', nome: 'Argentina', bandeira: '🇦🇷', cor: '#75AADB', cor2: '#FFFFFF',
    confirmada: true,
    historia: 'Os hermanos do sertão. Time raçudo, chega junto na dividida e não perde uma discussão com o juiz. Vamos, vamos, Argentina!',
    elenco: [
      { n: 3, nome: 'Zé Arnóbio', pos: 'ATA', foto: 'assets/cards/argentina/ze-arnobio.jpg' },
      { n: 7, nome: 'José Adair', pos: 'MEI', foto: 'assets/cards/argentina/jose-adair.jpg' },
      { n: 8, nome: 'Alex', pos: 'MEI', foto: 'assets/cards/argentina/alex.jpg' },
      { n: 9, nome: 'Ronaldo', pos: 'ATA', foto: 'assets/cards/argentina/ronaldo.jpg' },
      { n: 10, nome: 'Jonathan C.', pos: 'ATA', foto: 'assets/cards/argentina/jonathan.jpg' },
      { n: 11, nome: 'Marquinho', pos: 'ZAG', foto: 'assets/cards/argentina/marquinho.jpg' },
      { n: 13, nome: 'Obede', pos: 'ATA', foto: 'assets/cards/argentina/obede.jpg' },
      { n: 22, nome: 'Gabriel/Bolsonaro', pos: 'ATA', foto: 'assets/cards/argentina/gabriel.jpg' },
      { n: 89, nome: 'Reinaldo', pos: 'GOL', foto: 'assets/cards/argentina/reinaldo.jpg' },
    ],
  },
  {
    id: 'portugal', nome: 'Portugal', bandeira: '🇵🇹', cor: '#FF0000', cor2: '#006600',
    confirmada: true,
    historia: 'Os lusitanos do baba. Todo mundo se acha o Cristiano Ronaldo na hora de bater falta — o fôlego é que às vezes só dura o primeiro tempo.',
    elenco: [
      { n: 1, nome: 'Gildevan', pos: 'GOL', foto: 'assets/cards/portugal/gildevan.jpg' },
      { n: 5, nome: 'Diogo', pos: 'ATA', foto: 'assets/cards/portugal/diogo.jpg' },
      { n: 7, nome: 'Rogério' },
      { n: 10, nome: 'Yuri', pos: 'MEI', foto: 'assets/cards/portugal/yuri.jpg' },
      { n: 11, nome: 'Neguinho', pos: 'MEI', foto: 'assets/cards/portugal/neguinho.jpg' },
      { n: 12, nome: 'Gilvan', pos: 'GOL', foto: 'assets/cards/portugal/gilvan.jpg' },
      { n: 14, nome: 'Johnisson', pos: 'PIV', foto: 'assets/cards/portugal/johnisson.jpg' },
      { n: 18, nome: 'Pacas', pos: 'ATA', foto: 'assets/cards/portugal/pacas.jpg' },
      { n: 77, nome: 'Valdir Andrade', pos: 'ZAG', foto: 'assets/cards/portugal/valdir-andrade.jpg' },
      { n: 80, nome: 'Aelton' },
    ],
  },
];

// --- Jogos ----------------------------------------------------
// Todos contra todos em 5 rodadas (uma seleção folga por rodada).
// placar: null = ainda não jogado
const JOGOS = [
  // Rodízio (todos contra todos, 1 folga por rodada). Placares em branco:
  // o admin lança pelo painel e o app atualiza sozinho.
  // RODADA 1 — 30/08 — ABERTURA: Brasil × França! (folga: Noruega)
  { id: 1, rodada: 1, fase: 'Pontos Corridos', data: '2026-08-30T06:00:00-03:00', casa: 'brasil', fora: 'franca', placar: null },
  { id: 2, rodada: 1, fase: 'Pontos Corridos', data: '2026-08-30T06:50:00-03:00', casa: 'portugal', fora: 'argentina', placar: null },

  // RODADA 2 — 06/09 — folga: França
  { id: 3, rodada: 2, fase: 'Pontos Corridos', data: '2026-09-06T06:00:00-03:00', casa: 'noruega', fora: 'portugal', placar: null },
  { id: 4, rodada: 2, fase: 'Pontos Corridos', data: '2026-09-06T06:50:00-03:00', casa: 'argentina', fora: 'brasil', placar: null },

  // RODADA 3 — 13/09 — folga: Portugal
  { id: 5, rodada: 3, fase: 'Pontos Corridos', data: '2026-09-13T06:00:00-03:00', casa: 'franca', fora: 'argentina', placar: null },
  { id: 6, rodada: 3, fase: 'Pontos Corridos', data: '2026-09-13T06:50:00-03:00', casa: 'brasil', fora: 'noruega', placar: null },

  // RODADA 4 — 20/09 — folga: Argentina
  { id: 7, rodada: 4, fase: 'Pontos Corridos', data: '2026-09-20T06:00:00-03:00', casa: 'portugal', fora: 'brasil', placar: null },
  { id: 8, rodada: 4, fase: 'Pontos Corridos', data: '2026-09-20T06:50:00-03:00', casa: 'noruega', fora: 'franca', placar: null },

  // RODADA 5 — 27/09 — folga: Brasil
  { id: 9, rodada: 5, fase: 'Pontos Corridos', data: '2026-09-27T06:00:00-03:00', casa: 'argentina', fora: 'noruega', placar: null },
  { id: 10, rodada: 5, fase: 'Pontos Corridos', data: '2026-09-27T06:50:00-03:00', casa: 'franca', fora: 'portugal', placar: null },

  // FASE FINAL — 11/10 (domingo)
  { id: 11, rodada: 6, fase: 'Disputa 3º lugar', data: '2026-10-11T15:30:00-03:00', casa: null, fora: null, placar: null, desc: '3º colocado × 4º colocado' },
  { id: 12, rodada: 6, fase: 'GRANDE FINAL', data: '2026-10-11T16:20:00-03:00', casa: null, fora: null, placar: null, desc: '1º colocado × 2º colocado' },
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
  { nome: 'União Distribuidora', desc: 'Distribuidora · Canindé/SE', logo: 'assets/patrocinadores/uniao-distribuidora.png' },
  { nome: 'Mendonça Farma', desc: 'Farmácia', logo: 'assets/patrocinadores/mendonca-farma.jpg' },
  { nome: 'Disk Gelada São Pedro', desc: 'Bebidas · (79) 99887-5981', logo: 'assets/patrocinadores/disk-gelada-sao-pedro.png' },
  { nome: 'Batista & Ferreira', desc: 'Advogados associados', logo: 'assets/patrocinadores/batista-ferreira.png' },
  { nome: 'Play Kids Canindé', desc: 'Diversão infantil · Forródromo', logo: 'assets/patrocinadores/play-kids-caninde.png' },
  { nome: 'Dom Pacas Barbearia', desc: 'Barbearia', logo: 'assets/patrocinadores/dom-pacas-barbearia.jpg' },
  { nome: '77 Promoções', desc: 'Eventos e promoções', logo: 'assets/patrocinadores/77-promocoes.png' },
  { nome: 'Diogo Rodrigues', desc: 'Consultor imobiliário · Creci-AL 5018', logo: 'assets/patrocinadores/diogo-rodrigues.png' },
];
