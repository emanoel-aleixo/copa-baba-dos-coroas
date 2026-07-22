// ============================================================
// II COPA BABA DOS COROAS — conexão com o Supabase
// Mesmo projeto do Motion Lab; tabelas com prefixo copa_.
// Se o Supabase estiver fora do ar (ou as tabelas ainda não
// existirem), o app continua funcionando no modo local.
// ============================================================

const SUPA_URL = 'https://wewofcgbejxgyhqjujvg.supabase.co';
const SUPA_KEY = 'sb_publishable_uyFiO7zaQR7D4ju86OMSYw_oO6shAc2'; // chave pública (própria p/ navegador)

const supa = (window.supabase && SUPA_URL)
  ? window.supabase.createClient(SUPA_URL, SUPA_KEY)
  : null;

// Identidade anônima deste aparelho (para o bolão)
function deviceId() {
  let id = localStorage.getItem('device-id');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    localStorage.setItem('device-id', id);
  }
  return id;
}

// Registra 1 acesso deste aparelho por dia (para o contador do admin).
// Silencioso: se o Supabase estiver fora, não atrapalha o app.
async function registrarAcesso() {
  if (!supa) return;
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('acesso-registrado') === hoje) return; // já contou hoje
    const { error } = await supa.from('copa_acessos').insert([{ device_id: deviceId() }]);
    if (!error) localStorage.setItem('acesso-registrado', hoje);
  } catch { /* ignora */ }
}

// Total de acessos por dia (só admin autenticado consegue ler).
async function buscarAcessos() {
  if (!supa) return null;
  try {
    const { data, error } = await supa.rpc('copa_acessos_por_dia');
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// Busca resultados e fotos liberadas; aplica em cima dos dados locais.
// Retorna true se conseguiu falar com o servidor.
async function carregarAoVivo() {
  if (!supa) return false;
  try {
    const [res, fotos] = await Promise.all([
      supa.from('copa_resultados').select('*'),
      supa.from('copa_fotos_liberadas').select('foto_id'),
    ]);
    if (res.error || fotos.error) return false;

    res.data.forEach((r) => {
      const jogo = JOGOS.find((j) => j.id === r.jogo_id);
      if (jogo) {
        jogo.placar = [r.placar_casa, r.placar_fora];
        jogo.eventos = r.eventos;
      }
    });

    const liberadas = new Set(fotos.data.map((f) => f.foto_id));
    FOTOS.forEach((g) => g.fotos.forEach((f) => {
      if (liberadas.has(f.id)) f.liberada = true;
    }));

    return true;
  } catch {
    return false;
  }
}

// ---------- Bolão PAGO por jogo ----------
// Busca todos os palpites (com status de pagamento) para montar
// prêmios, acumulado e ranking.
async function buscarPalpites() {
  if (!supa) return null;
  try {
    const { data, error } = await supa
      .from('copa_palpites')
      .select('id, device_id, nome, whatsapp, jogo_id, palpite_casa, palpite_fora, pago, created_at')
      .order('created_at', { ascending: true });
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// Registra UM palpite (sempre não pago; só o admin confirma o pagamento)
async function enviarPalpiteJogo(jogoId, palpite, nome, whatsapp) {
  if (!supa) return false;
  const jogo = JOGOS.find((j) => j.id === jogoId);
  // só aceita dentro da janela (segunda → sábado à noite)
  if (!jogo || jogo.placar || !bolaoAberto(jogo)) return false;
  try {
    const { error } = await supa.from('copa_palpites').insert([{
      device_id: deviceId(),
      nome: nome || 'Palpiteiro',
      whatsapp: whatsapp || null,
      jogo_id: jogoId,
      palpite_casa: palpite[0],
      palpite_fora: palpite[1],
      pago: false,
    }]);
    return !error;
  } catch {
    return false;
  }
}

// (antigo) Envia os palpites deste aparelho para o bolão geral
async function enviarPalpitesNuvem(palpites, nome) {
  if (!supa) return false;
  const linhas = Object.entries(palpites)
    .filter(([jogoId]) => {
      const jogo = JOGOS.find((j) => j.id === Number(jogoId));
      return jogo && !jogo.placar && new Date(jogo.data) > new Date();
    })
    .map(([jogoId, [pc, pf]]) => ({
      device_id: deviceId(),
      nome: nome || 'Palpiteiro',
      jogo_id: Number(jogoId),
      palpite_casa: pc,
      palpite_fora: pf,
    }));
  if (!linhas.length) return true;
  try {
    const { error } = await supa.from('copa_palpites').insert(linhas);
    return !error;
  } catch {
    return false;
  }
}

// Ranking geral: último palpite de cada aparelho por jogo,
// enviado ANTES do horário do jogo, corrigido pelos resultados.
async function buscarRankingBolao() {
  if (!supa) return null;
  try {
    const { data, error } = await supa
      .from('copa_palpites')
      .select('device_id, nome, jogo_id, palpite_casa, palpite_fora, created_at')
      .order('created_at', { ascending: true });
    if (error) return null;

    const valido = {};
    data.forEach((p) => {
      const jogo = JOGOS.find((j) => j.id === p.jogo_id);
      if (!jogo || !jogo.casa) return;
      if (new Date(p.created_at) >= new Date(jogo.data)) return; // depois da bola rolar não vale
      valido[`${p.device_id}|${p.jogo_id}`] = p; // ordem asc → o último sobrescreve
    });

    const porPessoa = {};
    Object.values(valido).forEach((p) => {
      const jogo = JOGOS.find((j) => j.id === p.jogo_id);
      const pessoa = porPessoa[p.device_id] =
        porPessoa[p.device_id] || { nome: p.nome, pts: 0, exatos: 0, palpites: 0 };
      pessoa.nome = p.nome; // nome mais recente
      pessoa.palpites++;
      const pts = pontosDoPalpite(jogo, [p.palpite_casa, p.palpite_fora]);
      if (pts !== null) {
        pessoa.pts += pts;
        if (pts === 3) pessoa.exatos++;
      }
    });

    return Object.entries(porPessoa)
      .map(([device, p]) => ({ ...p, souEu: device === deviceId() }))
      .sort((a, b) => b.pts - a.pts || b.exatos - a.exatos || b.palpites - a.palpites);
  } catch {
    return null;
  }
}
