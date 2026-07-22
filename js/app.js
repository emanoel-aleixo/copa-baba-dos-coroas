// ============================================================
// II COPA BABA DOS COROAS — lógica do app
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- RESET DE LANÇAMENTO ----------
// Bump esta versão para zerar o progresso de TODO MUNDO que já testou
// (álbum, palpites, tutorial). Cada aparelho, ao abrir com uma versão nova,
// limpa os dados locais uma vez e começa do zero.
const DADOS_VERSAO = '2026-lancamento';
(function resetLancamento() {
  try {
    if (localStorage.getItem('dados-versao') === DADOS_VERSAO) return;
    ['album-copa', 'album-ultimo-pacote', 'bolao-palpites', 'bolao-nome',
     'resultados-vistos', 'onboarding-visto', 'install-dispensado']
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('dados-versao', DADOS_VERSAO);
  } catch (e) { /* localStorage indisponível: segue normal */ }
})();

// Protege textos digitados pelos usuários (nomes do bolão etc.)
const escapaHtml = (t) => String(t).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const timePorId = (id) => SELECOES.find((s) => s.id === id);

const fmtData = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
};
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

// ---------- Navegação entre seções ----------
// Seções que têm botão próprio no menu; as demais (fotos, patro) destacam "Mais"
const NAV_SECOES = ['inicio', 'jogos', 'selecoes', 'album', 'mais'];
function irPara(secao) {
  $$('.secao').forEach((s) => s.classList.remove('ativa'));
  $(`#secao-${secao}`).classList.add('ativa');
  const navAlvo = NAV_SECOES.includes(secao) ? secao : 'mais';
  $$('.nav-inferior button').forEach((b) => b.classList.toggle('ativa', b.dataset.secao === navAlvo));
  window.scrollTo({ top: 0 });
}

// ---------- Celebrações (confete + vibração) ----------
const CORES_FESTA = ['#d9a62b', '#f5c84c', '#1f7a3d', '#ffffff'];

function vibrar(padrao) {
  if (navigator.vibrate) navigator.vibrate(padrao);
}

function festejar(intenso = false) {
  if (typeof confetti !== 'function') return; // sem internet, sem confete — app segue normal
  confetti({ particleCount: intenso ? 180 : 80, spread: intenso ? 100 : 70, origin: { y: 0.6 }, colors: CORES_FESTA });
  if (intenso) {
    setTimeout(() => confetti({ particleCount: 120, spread: 120, origin: { y: 0.4 }, colors: CORES_FESTA }), 350);
  }
}

// ---------- Contagem regressiva ----------
// Troca de número com animação de rolagem (painel de aeroporto)
function poeNumero(sel, valor) {
  const el = $(sel);
  if (el.textContent === valor) return;
  el.textContent = valor;
  el.classList.remove('rolou');
  void el.offsetWidth; // reinicia a animação
  el.classList.add('rolou');
}

function atualizaContagem() {
  const alvo = new Date(COPA.inicio).getTime();
  const agora = Date.now();
  let diff = Math.max(0, alvo - agora);

  const dias = Math.floor(diff / 86400000);
  const horas = Math.floor((diff % 86400000) / 3600000);
  const min = Math.floor((diff % 3600000) / 60000);
  const seg = Math.floor((diff % 60000) / 1000);

  poeNumero('#cont-dias', String(dias).padStart(2, '0'));
  poeNumero('#cont-horas', String(horas).padStart(2, '0'));
  poeNumero('#cont-min', String(min).padStart(2, '0'));
  poeNumero('#cont-seg', String(seg).padStart(2, '0'));

  if (diff === 0) $('#contagem-rotulo').textContent = 'A BOLA JÁ ESTÁ ROLANDO!';
}

// ---------- Classificação (calculada dos resultados) ----------
// Pontos corridos: 1º e 2º fazem a final, 3º e 4º disputam o bronze,
// o 5º está eliminado.
function calculaClassificacao() {
  const tab = {};
  SELECOES.forEach((s) => {
    tab[s.id] = { time: s, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 };
  });

  JOGOS.filter((j) => j.fase === 'Pontos Corridos' && j.placar).forEach((j) => {
    const [gc, gf] = j.placar;
    const casa = tab[j.casa];
    const fora = tab[j.fora];
    casa.j++; fora.j++;
    casa.gp += gc; casa.gc += gf;
    fora.gp += gf; fora.gc += gc;
    if (gc > gf) { casa.v++; casa.p += 3; fora.d++; }
    else if (gf > gc) { fora.v++; fora.p += 3; casa.d++; }
    else { casa.e++; fora.e++; casa.p++; fora.p++; }
  });

  const ordena = (a, b) => b.p - a.p || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp;
  return Object.values(tab).sort(ordena);
}

const ZONAS = ['zona-final', 'zona-final', 'zona-bronze', 'zona-bronze', 'zona-eliminado'];

function renderClassificacao() {
  const classi = calculaClassificacao();
  $('#classificacao').innerHTML = `
    <div class="card">
      <span class="chip">Todos contra todos</span>
      <table class="tabela">
        <thead><tr><th>Seleção</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr></thead>
        <tbody>
          ${classi.map((l, i) => `
            <tr class="${ZONAS[i] || ''}">
              <td><span class="time-cel"><span class="pos">${i + 1}</span> ${l.time.bandeira} ${l.time.nome}</span></td>
              <td class="pts">${l.p}</td><td>${l.j}</td><td>${l.v}</td><td>${l.e}</td><td>${l.d}</td><td>${l.gp - l.gc}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="card legenda-zonas">
      <p>🟩 <b>1º e 2º</b> — fazem a GRANDE FINAL</p>
      <p>🟨 <b>3º e 4º</b> — disputam o 3º lugar</p>
      <p>🟥 <b>5º</b> — eliminado</p>
    </div>`;
}

// ---------- Jogos ----------
function cardJogo(j) {
  const casa = j.casa ? timePorId(j.casa) : null;
  const fora = j.fora ? timePorId(j.fora) : null;
  const nomeCasa = casa ? `<span class="band">${casa.bandeira}</span>${casa.nome}` : '<span class="band">❔</span>A definir';
  const nomeFora = fora ? `<span class="band">${fora.bandeira}</span>${fora.nome}` : '<span class="band">❔</span>A definir';

  const placar = j.placar
    ? `<div class="placar">${j.placar[0]} <span class="x">×</span> ${j.placar[1]}</div>`
    : `<div class="placar futuro"><span class="hora">${fmtHora(j.data)}</span><span>${fmtData(j.data)}</span></div>`;

  const eventos = j.placar && j.eventos ? `
    <div class="jogo-meta">
      ${j.eventos.gols.map((g) => `⚽ ${g.jogador}${g.assist ? ` <small>(assist. ${g.assist})</small>` : ''}`).join(' &nbsp;·&nbsp; ') || 'Sem gols'}
      ${j.eventos.amarelos.length ? `<br>🟨 ${j.eventos.amarelos.map((c) => c.jogador).join(', ')}` : ''}
      ${j.eventos.vermelhos.length ? `<br>🟥 ${j.eventos.vermelhos.map((c) => c.jogador).join(', ')}` : ''}
    </div>` : (j.desc ? `<div class="jogo-meta">${j.desc}</div>` : '');

  return `
    <div class="jogo">
      <div class="time">${nomeCasa}</div>
      ${placar}
      <div class="time">${nomeFora}</div>
      ${eventos}
    </div>`;
}

function renderJogos() {
  const porFase = {};
  JOGOS.forEach((j) => {
    const chave = j.fase === 'Pontos Corridos' ? `Rodada ${j.rodada}` : j.fase;
    (porFase[chave] = porFase[chave] || []).push(j);
  });

  $('#lista-jogos').innerHTML = Object.entries(porFase).map(([fase, jogos]) => {
    // Com 5 seleções, uma folga por rodada na fase de pontos corridos
    let folga = '';
    if (jogos[0].fase === 'Pontos Corridos') {
      const emCampo = jogos.flatMap((j) => [j.casa, j.fora]);
      const descansa = SELECOES.find((s) => !emCampo.includes(s.id));
      if (descansa) folga = `<p class="folga">😴 Folga da rodada: ${descansa.bandeira} ${descansa.nome}</p>`;
    }
    return `
      <h3 class="rodada-titulo">${fase}</h3>
      ${folga}
      ${jogos.map(cardJogo).join('')}`;
  }).join('');
}

// ---------- Rankings (artilharia, assistências, cartões) ----------
function calculaRankings() {
  const soma = (mapa, chave, timeId) => {
    const k = `${timeId}|${chave}`;
    mapa[k] = mapa[k] || { nome: chave, time: timePorId(timeId), total: 0 };
    mapa[k].total++;
  };

  const gols = {}, assist = {}, amarelos = {}, vermelhos = {};
  JOGOS.filter((j) => j.placar && j.eventos).forEach((j) => {
    j.eventos.gols.forEach((g) => {
      soma(gols, g.jogador, g.time);
      if (g.assist) soma(assist, g.assist, g.time);
    });
    j.eventos.amarelos.forEach((c) => soma(amarelos, c.jogador, c.time));
    j.eventos.vermelhos.forEach((c) => soma(vermelhos, c.jogador, c.time));
  });

  const top = (mapa) => Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 10);
  return { gols: top(gols), assist: top(assist), amarelos: top(amarelos), vermelhos: top(vermelhos) };
}

function renderRankings() {
  const r = calculaRankings();
  const medalhas = ['🥇', '🥈', '🥉'];

  const lista = (itens, icone, classe = '') => itens.length
    ? `<ol class="rank-lista">${itens.map((i, idx) => `
        <li>
          <span class="medalha">${medalhas[idx] || idx + 1}</span>
          <span class="info"><b>${i.nome}</b><br><span class="t">${i.time.bandeira} ${i.time.nome}</span></span>
          <span class="valor ${classe}">${i.total} ${icone}</span>
        </li>`).join('')}</ol>`
    : '<p class="vazio">Ainda não há registros.</p>';

  $('#rank-gols').innerHTML = lista(r.gols, '⚽');
  $('#rank-assist').innerHTML = lista(r.assist, '👟');
  $('#rank-amarelos').innerHTML = lista(r.amarelos, '🟨', 'amarelo');
  $('#rank-vermelhos').innerHTML = lista(r.vermelhos, '🟥', 'vermelho');
}

// ---------- Seleções ----------
const selo = (s) => s.confirmada
  ? '<span class="grupo confirmada">✅ Confirmada</span>'
  : '<span class="grupo pendente">⏳ Aguardando sorteio</span>';

function renderSelecoes() {
  $('#grade-selecoes').innerHTML = SELECOES.map((s) => `
    <div class="card-selecao ${s.confirmada ? '' : 'vaga'}" style="--faixa: linear-gradient(90deg, ${s.cor}, ${s.cor2})" onclick="abrirSelecao('${s.id}')">
      <div class="band">${s.bandeira}</div>
      <h3>${s.nome}</h3>
      ${selo(s)}
    </div>`).join('');
}

function abrirSelecao(id) {
  const s = timePorId(id);
  const classi = calculaClassificacao();
  const pos = classi.findIndex((l) => l.time.id === id);
  const linha = classi[pos];

  const corpo = s.confirmada ? `
    <div class="stats-mini">
      <div class="stat"><div class="v">${linha.p}</div><div class="r">Pontos</div></div>
      <div class="stat"><div class="v">${linha.v}</div><div class="r">Vitórias</div></div>
      <div class="stat"><div class="v">${linha.gp}</div><div class="r">Gols pró</div></div>
      <div class="stat"><div class="v">${linha.gc}</div><div class="r">Gols sofridos</div></div>
    </div>
    <div class="card">
      <span class="chip">História</span>
      <p style="font-size:14px; line-height:1.6; margin-top:10px">${s.historia}</p>
    </div>
    <div class="card">
      <span class="chip">Elenco</span>
      ${s.elenco.length ? `<ul class="lista-elenco" style="margin-top:8px">
        ${s.elenco.map((j) => `<li><span class="num">${j.n}</span> ${j.nome} ${j.pos ? `<span class="pos-tag">${j.pos}</span>` : ''}</li>`).join('')}
      </ul>` : '<p class="vazio">Escalação será divulgada em breve.</p>'}
    </div>` : `
    <div class="card">
      <span class="chip">⏳ Vaga em aberto</span>
      <p style="font-size:14px; line-height:1.6; margin-top:10px">${s.historia}</p>
    </div>`;

  $('#detalhe-selecao').innerHTML = `
    <button class="voltar" onclick="fecharSelecao()">← Voltar às seleções</button>
    <div class="banner-selecao" style="background: linear-gradient(160deg, ${s.cor}33, ${s.cor2}22)">
      <div class="band">${s.bandeira}</div>
      <h2>${s.nome}</h2>
      <span class="chip">${s.confirmada ? '✅ Seleção confirmada' : '⏳ Aguardando sorteio'}</span>
    </div>
    ${corpo}`;

  $('#grade-selecoes').style.display = 'none';
  $('#intro-selecoes').style.display = 'none';
  $('#detalhe-selecao').style.display = 'block';
}

function fecharSelecao() {
  $('#detalhe-selecao').style.display = 'none';
  $('#grade-selecoes').style.display = 'grid';
  $('#intro-selecoes').style.display = 'block';
}

// ---------- Álbum de figurinhas ----------
// Coleção salva no aparelho (localStorage). Um pacotinho com 3 por dia.
const TODAS_FIGURINHAS = SELECOES.flatMap((s) =>
  s.elenco.map((j) => ({ fig: `${s.id}-${j.n}`, selecao: s, jogador: j }))
);

function lerAlbum() {
  try { return JSON.parse(localStorage.getItem('album-copa') || '{}'); }
  catch { return {}; }
}
const salvarAlbum = (a) => localStorage.setItem('album-copa', JSON.stringify(a));

const hojeStr = () => new Date().toISOString().slice(0, 10);
const pacoteDisponivel = () => localStorage.getItem('album-ultimo-pacote') !== hojeStr();

function abrirPacote() {
  if (!pacoteDisponivel()) return;
  const album = lerAlbum();
  const novas = [];

  for (let i = 0; i < 3; i++) {
    const sorteada = TODAS_FIGURINHAS[Math.floor(Math.random() * TODAS_FIGURINHAS.length)];
    album[sorteada.fig] = (album[sorteada.fig] || 0) + 1;
    novas.push(sorteada);
  }

  salvarAlbum(album);
  localStorage.setItem('album-ultimo-pacote', hojeStr());

  const raras = figurinhasRaras();
  $('#pacote-aberto').innerHTML = novas.map((f) => {
    const rara = raras.has(`${f.selecao.id}-${f.jogador.n}`);
    const visual = f.jogador.foto
      ? `<img class="foto-fig" src="${f.jogador.foto}" alt="${f.jogador.nome}">`
      : `<span class="rosto">${f.selecao.bandeira}</span>
         <b>${f.jogador.nome}</b>
         <span>#${f.jogador.n} · ${f.selecao.nome}</span>`;
    return `
    <div class="figurinha colada ${rara ? 'rara' : ''} ${f.jogador.foto ? 'com-foto' : ''}">
      ${visual}
      ${rara ? '<span class="selo-rara">⚽ ARTILHEIRO</span>' : ''}
    </div>`;
  }).join('');

  // festa! (mais intensa se completou uma seleção inteira com esse pacote)
  const completou = SELECOES.some((s) =>
    novas.some((f) => f.selecao.id === s.id) &&
    s.elenco.every((j) => album[`${s.id}-${j.n}`])
  );
  vibrar([60, 40, 60]);
  festejar(completou);

  renderAlbum();
}

// Figurinhas raras: os 3 maiores artilheiros ganham versão dourada
function figurinhasRaras() {
  const chaves = new Set();
  calculaRankings().gols.slice(0, 3).forEach((g) => {
    const j = g.time.elenco.find((x) => x.nome === g.nome);
    if (j) chaves.add(`${g.time.id}-${j.n}`);
  });
  return chaves;
}

// ---------- Troca de figurinhas ----------
// O app monta sozinho as listas "TENHO" (repetidas) e "PRECISO" (faltando).
// A pessoa chama a galera no WhatsApp e, ao fechar negócio, registra a troca:
// tira 1 da repetida que deu e cola a que recebeu.
const nomeFig = (f) => `${f.jogador.nome} (${f.selecao.nome})`;

function minhasRepetidas() {
  const album = lerAlbum();
  return TODAS_FIGURINHAS
    .filter((f) => (album[f.fig] || 0) > 1)
    .map((f) => ({ ...f, sobrando: album[f.fig] - 1 }));
}
const minhasFaltando = () => {
  const album = lerAlbum();
  return TODAS_FIGURINHAS.filter((f) => !album[f.fig]);
};

function renderTroca() {
  const alvo = $('#area-troca');
  if (!alvo) return;
  const repetidas = minhasRepetidas();
  const faltando = minhasFaltando();

  if (!repetidas.length && !faltando.length) { alvo.innerHTML = ''; return; }

  const opcoes = (lista, tipo) => lista.map((f, i) =>
    `<option value="${f.fig}">${escapaHtml(nomeFig(f))}${tipo === 'dei' ? ` ×${f.sobrando}` : ''}</option>`).join('');

  alvo.innerHTML = `
    <div class="card card-troca">
      <span class="chip">🔄 Trocar figurinhas</span>
      <div class="troca-resumo">
        <div><b>${repetidas.length}</b><span>repetidas para trocar</span></div>
        <div><b>${faltando.length}</b><span>faltando no álbum</span></div>
      </div>

      ${repetidas.length
        ? `<p class="troca-lista"><b>Você tem repetida:</b> ${repetidas.map((f) => escapaHtml(f.jogador.nome) + (f.sobrando > 1 ? ` ×${f.sobrando}` : '')).join(' · ')}</p>`
        : '<p class="troca-lista" style="color:var(--texto-2)">Você ainda não tem figurinhas repetidas. Abra os pacotinhos diários!</p>'}

      <button class="btn-bolao secundario" onclick="chamarTroca()">📤 Chamar a galera no WhatsApp</button>

      ${repetidas.length && faltando.length ? `
        <div class="troca-registrar">
          <p class="troca-titulo">Fechou a troca? Registre aqui:</p>
          <label class="troca-campo">
            <span>Dei a repetida</span>
            <select id="troca-dei">${opcoes(repetidas, 'dei')}</select>
          </label>
          <label class="troca-campo">
            <span>Recebi</span>
            <select id="troca-recebi">${opcoes(faltando, 'recebi')}</select>
          </label>
          <button class="btn-bolao" onclick="registrarTroca()">🤝 Confirmar troca</button>
        </div>` : ''}
    </div>`;
}

// Monta a mensagem de troca para o WhatsApp
function chamarTroca() {
  const repetidas = minhasRepetidas();
  const faltando = minhasFaltando();
  const nome = localStorage.getItem('bolao-nome');

  const linhaTenho = repetidas.length
    ? repetidas.map((f) => nomeFig(f) + (f.sobrando > 1 ? ` (×${f.sobrando})` : '')).join(', ')
    : 'nenhuma ainda';
  // limita a lista de faltantes para a mensagem não ficar gigante
  const faltaTxt = faltando.length
    ? faltando.slice(0, 12).map(nomeFig).join(', ') + (faltando.length > 12 ? ` … (+${faltando.length - 12})` : '')
    : 'já completei o álbum! 🏆';

  const texto = `🔄 *TROCA DE FIGURINHAS — II Copa Baba dos Coroas*\n`
    + (nome ? `De: ${nome}\n` : '')
    + `\n🎴 *Tenho repetidas:* ${linhaTenho}`
    + `\n\n🔎 *Preciso:* ${faltaTxt}`
    + `\n\nQuem tem? Bora trocar! 👑\nMonte o seu álbum: https://emanoel-aleixo.github.io/copa-baba-dos-coroas/`;

  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

// Efetiva a troca no álbum: -1 na que deu, +1 na que recebeu
function registrarTroca() {
  const dei = $('#troca-dei')?.value;
  const recebi = $('#troca-recebi')?.value;
  if (!dei || !recebi) return;
  if (dei === recebi) { alert('Escolha figurinhas diferentes 🙂'); return; }

  const album = lerAlbum();
  if ((album[dei] || 0) < 2) { alert('Você não tem essa figurinha repetida.'); renderTroca(); return; }
  if (album[recebi]) { alert('Você já tem essa figurinha no álbum.'); renderTroca(); return; }

  album[dei] -= 1;
  album[recebi] = 1;
  salvarAlbum(album);

  const nova = TODAS_FIGURINHAS.find((f) => f.fig === recebi);
  vibrar([60, 40, 60]);
  festejar(false);
  renderAlbum();
  alert(`🤝 Troca registrada! ${nova ? nomeFig(nova) : 'Figurinha'} colada no seu álbum.`);
}

function renderAlbum() {
  const album = lerAlbum();
  const comElenco = SELECOES.filter((s) => s.elenco.length);
  const coladas = TODAS_FIGURINHAS.filter((f) => album[f.fig]).length;
  const total = TODAS_FIGURINHAS.length;
  const pct = total ? Math.round((coladas / total) * 100) : 0;
  const pendentes = SELECOES.filter((s) => !s.confirmada).length;

  $('#album-resumo').innerHTML = `<b>${coladas}</b> de <b>${total}</b> figurinhas coladas — <b>${pct}%</b>`;
  $('#album-barra').style.width = `${pct}%`;

  const btn = $('#btn-pacote');
  const podeAbrir = pacoteDisponivel() && total > 0;
  btn.disabled = !podeAbrir;
  btn.textContent = total === 0
    ? '⏳ Figurinhas em breve!'
    : (pacoteDisponivel() ? '🎁 Abrir pacotinho do dia (3 figurinhas)' : '⏳ Volte amanhã para outro pacotinho!');

  renderTroca();

  const raras = figurinhasRaras();
  $('#album-grades').innerHTML = comElenco.map((s) => `
    <h3 class="rodada-titulo">${s.bandeira} ${s.nome}</h3>
    <div class="grade-figurinhas">
      ${s.elenco.map((j) => {
        const chave = `${s.id}-${j.n}`;
        const qtd = album[chave] || 0;
        const rara = qtd && raras.has(chave);
        const visual = j.foto
          ? `<img class="foto-fig" src="${j.foto}" alt="${j.nome}" loading="lazy">`
          : `<span class="rosto">${s.bandeira}</span><b>${j.nome}</b><span>#${j.n}</span>`;
        return qtd
          ? `<div class="figurinha colada ${rara ? 'rara' : ''} ${j.foto ? 'com-foto' : ''}">${visual}${qtd > 1 ? `<span class="rep">×${qtd}</span>` : ''}${rara ? '<span class="selo-rara">⚽ ARTILHEIRO</span>' : ''}</div>`
          : `<div class="figurinha"><span class="interroga">?</span><span>#${j.n}</span></div>`;
      }).join('')}
    </div>`).join('') + (pendentes ? `
    <p class="subtitulo" style="margin-top:16px">🎴 Mais <b>${pendentes}</b> ${pendentes > 1 ? 'seleções entram' : 'seleção entra'} no álbum após o sorteio!</p>` : '');
}

// ---------- Bolão de palpites ----------
// v1: palpites salvos no aparelho (localStorage). O ranking geral entre
// todos os palpiteiros vem junto com o Supabase.
// Pontuação: placar exato = 3 pts · acertou vencedor/empate = 1 pt.
function lerPalpites() {
  try { return JSON.parse(localStorage.getItem('bolao-palpites') || '{}'); }
  catch { return {}; }
}

// ---------- Bolão PAGO por jogo ----------
// R$ 5 por palpite. Quem acerta o PLACAR EXATO leva o bolo do jogo
// (dividido se houver mais de um). Ninguém acertou → ACUMULA pro próximo.
// O app não movimenta dinheiro: o Pix vai direto pra Associação e o
// admin confirma cada pagamento no painel.
let PALPITES = []; // cache do que veio do servidor

const fmtReal = (v) => 'R$ ' + Number(v).toFixed(2).replace('.', ',');

async function carregarPalpites() {
  const dados = await buscarPalpites();
  if (dados) PALPITES = dados;
  return dados !== null;
}

// Um palpite por aparelho/jogo: vale o pago; senão, o mais recente
function palpitesValidos() {
  const mapa = {};
  PALPITES.forEach((p) => {
    const chave = `${p.device_id}|${p.jogo_id}`;
    const atual = mapa[chave];
    if (!atual || p.pago || !atual.pago) mapa[chave] = p;
  });
  return Object.values(mapa);
}

const meuPalpiteDoJogo = (jogoId) =>
  palpitesValidos().find((p) => p.jogo_id === jogoId && p.device_id === deviceId());

// Prêmio de cada jogo + acumulado (só palpites PAGOS valem)
// Janela de palpites de cada jogo: abre na SEGUNDA-FEIRA da semana do jogo
// e fecha no SÁBADO à noite (véspera). Jogo é sempre no domingo.
function janelaBolao(jogo) {
  const j = new Date(jogo.data);
  const abre = new Date(j); abre.setDate(j.getDate() - 6); abre.setHours(0, 0, 0, 0);
  const fecha = new Date(j); fecha.setDate(j.getDate() - 1); fecha.setHours(23, 59, 59, 999);
  return { abre, fecha };
}
const bolaoAberto = (jogo) => {
  if (!jogo || jogo.placar) return false;
  const { abre, fecha } = janelaBolao(jogo);
  const agora = new Date();
  return agora >= abre && agora <= fecha;
};
const fmtDiaMes = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

function calcularPremios() {
  const pagos = palpitesValidos().filter((p) => p.pago);
  const jogos = JOGOS.filter((j) => j.casa && j.fora)
    .slice().sort((a, b) => new Date(a.data) - new Date(b.data));

  const info = {};
  let acumulado = 0;
  let jaMarcouPendente = false;

  jogos.forEach((j) => {
    const doJogo = pagos.filter((p) => p.jogo_id === j.id);
    const arrecadado = doJogo.length * COPA.bolaoValor;

    if (j.placar) {
      const bolo = arrecadado + acumulado;
      const vencedores = doJogo.filter(
        (p) => p.palpite_casa === j.placar[0] && p.palpite_fora === j.placar[1]
      );
      info[j.id] = { pagantes: doJogo.length, entra: acumulado, bolo, vencedores, decidido: true };
      acumulado = vencedores.length ? 0 : bolo;
    } else {
      // o acumulado entra só no próximo jogo a ser disputado
      const entra = jaMarcouPendente ? 0 : acumulado;
      jaMarcouPendente = true;
      info[j.id] = { pagantes: doJogo.length, entra, bolo: arrecadado + entra, vencedores: [], decidido: false };
    }
  });

  return { info, acumulado };
}

function pontosDoPalpite(jogo, palpite) {
  if (!jogo.placar || !palpite) return null;
  const [ra, rf] = jogo.placar;
  const [pa, pf] = palpite;
  if (ra === pa && rf === pf) return 3;
  if (Math.sign(ra - rf) === Math.sign(pa - pf)) return 1;
  return 0;
}

function renderBolao() {
  const nome = localStorage.getItem('bolao-nome') || '';
  const zap = localStorage.getItem('bolao-whats') || '';
  const { info, acumulado } = calcularPremios();

  const confirmado = (id) => { const t = timePorId(id); return t && t.confirmada; };
  const valido = (j) => j.casa && j.fora && confirmado(j.casa) && confirmado(j.fora);
  const porData = (a, b) => new Date(a.data) - new Date(b.data);

  // Aberto agora (segunda → sábado à noite)
  const abertos = JOGOS.filter((j) => !j.placar && valido(j) && bolaoAberto(j)).sort(porData);
  // Ainda vai abrir (jogos das próximas semanas)
  const emBreve = JOGOS
    .filter((j) => !j.placar && valido(j) && new Date() < janelaBolao(j).abre)
    .sort(porData);
  // Fechou o palpite mas o jogo ainda não aconteceu
  const aguardando = JOGOS
    .filter((j) => !j.placar && valido(j) && new Date() > janelaBolao(j).fecha)
    .sort(porData);
  const encerrados = JOGOS
    .filter((j) => j.placar && j.casa && j.fora)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const cabecalhoJogo = (j, inf) => {
    const casa = timePorId(j.casa), fora = timePorId(j.fora);
    return `
      <div class="bolao-topo">
        <span class="bolao-jogo">${casa.bandeira} ${casa.nome} <span class="x">×</span> ${fora.nome} ${fora.bandeira}</span>
        <span class="bolao-data">${fmtData(j.data)} · ${fmtHora(j.data)}</span>
      </div>
      <div class="bolao-premio">
        <span class="premio-valor">${fmtReal(inf.bolo)}</span>
        <span class="premio-info">${inf.pagantes} palpite${inf.pagantes === 1 ? '' : 's'} pago${inf.pagantes === 1 ? '' : 's'}${inf.entra > 0 ? ` · 🔥 ${fmtReal(inf.entra)} acumulado` : ''}</span>
      </div>`;
  };

  const cardAberto = (j) => {
    const casa = timePorId(j.casa), fora = timePorId(j.fora);
    const inf = info[j.id] || { pagantes: 0, entra: 0, bolo: 0 };
    const meu = meuPalpiteDoJogo(j.id);

    if (meu) {
      return `
        <div class="card card-bolao">
          ${cabecalhoJogo(j, inf)}
          <div class="meu-palpite">Seu palpite: <b>${meu.palpite_casa} × ${meu.palpite_fora}</b></div>
          ${meu.pago
            ? '<div class="selo-pago">✅ Pagamento confirmado — boa sorte!</div>'
            : `<div class="selo-pendente">⏳ Aguardando confirmação do Pix</div>
               <button class="btn-bolao secundario" onclick="cobrarPix(${j.id})">💬 Ver o Pix / enviar comprovante</button>`}
        </div>`;
    }

    return `
      <div class="card card-bolao">
        ${cabecalhoJogo(j, inf)}
        <div class="palpite-jogo" data-jogo="${j.id}">
          <span class="time">${casa.bandeira}<br>${casa.nome}</span>
          <input type="number" min="0" max="30" inputmode="numeric" aria-label="Gols ${casa.nome}">
          <span class="x">×</span>
          <input type="number" min="0" max="30" inputmode="numeric" aria-label="Gols ${fora.nome}">
          <span class="time">${fora.bandeira}<br>${fora.nome}</span>
        </div>
        <button class="btn-bolao" onclick="palpitarJogo(${j.id})">🎯 Palpitar · ${fmtReal(COPA.bolaoValor)}</button>
      </div>`;
  };

  const cardEncerrado = (j) => {
    const casa = timePorId(j.casa), fora = timePorId(j.fora);
    const inf = info[j.id] || { pagantes: 0, bolo: 0, vencedores: [] };
    const venc = inf.vencedores || [];
    const meu = meuPalpiteDoJogo(j.id);
    const cada = venc.length ? inf.bolo / venc.length : 0;
    const euGanhei = meu && meu.pago && venc.some((v) => v.device_id === deviceId());
    return `
      <div class="card card-bolao">
        <div class="bolao-topo">
          <span class="bolao-jogo">${casa.bandeira} ${j.placar[0]} <span class="x">×</span> ${j.placar[1]} ${fora.bandeira}</span>
          <span class="bolao-data">${fmtData(j.data)}</span>
        </div>
        ${venc.length
          ? `<p class="bolao-resultado">🏆 ${venc.length === 1 ? 'Ganhador' : 'Ganhadores'}:
             <b>${venc.map((v) => escapaHtml(v.nome)).join(', ')}</b><br>
             <span class="premio-valor">${fmtReal(cada)}</span>${venc.length > 1 ? ' para cada' : ''}</p>`
          : `<p class="bolao-resultado">😅 Ninguém acertou o placar — <b>${fmtReal(inf.bolo)}</b> acumulou pro próximo jogo!</p>`}
        ${meu ? `<div class="meu-palpite">Seu palpite: <b>${meu.palpite_casa} × ${meu.palpite_fora}</b>${euGanhei ? ' 🎉 <b>VOCÊ GANHOU!</b>' : ''}</div>` : ''}
      </div>`;
  };

  $('#conteudo-bolao').innerHTML = `
    <div class="card album-progresso">
      <span class="chip">🎯 Bolão · ${fmtReal(COPA.bolaoValor)} por jogo</span>
      <p style="margin-top:10px; font-size:13px; line-height:1.6">
        Crave o <b>placar exato</b> e pague ${fmtReal(COPA.bolaoValor)} no Pix.
        Quem acertar <b>leva o bolo</b>! Ninguém acertou? <b>Acumula pro próximo</b> 🔥<br>
        🗓️ <b>Cada jogo tem seu bolão</b>: abre na <b>segunda-feira</b> e fecha no <b>sábado à noite</b>.<br>
        <span style="color:var(--texto-2)">Todo o valor arrecadado volta em prêmio para os participantes.</span>
      </p>
      ${acumulado > 0 ? `<div class="acumulou">🔥 ACUMULOU! <b>${fmtReal(acumulado)}</b> no próximo jogo</div>` : ''}
      <input class="campo-nome" id="bolao-nome" type="text" maxlength="30" placeholder="Seu nome" value="${escapaHtml(nome)}">
      <input class="campo-nome" id="bolao-whats" type="tel" maxlength="20" placeholder="Seu WhatsApp (com DDD)" value="${escapaHtml(zap)}">
    </div>

    ${abertos.length
      ? `<h3 class="rodada-titulo">🟢 Aberto para palpite</h3>${abertos.map(cardAberto).join('')}`
      : '<p class="vazio">Nenhum jogo aberto agora. O bolão do próximo jogo abre na segunda-feira! 🗓️</p>'}

    ${aguardando.length ? `
      <h3 class="rodada-titulo">⏳ Palpites encerrados</h3>
      ${aguardando.map((j) => {
        const casa = timePorId(j.casa), fora = timePorId(j.fora);
        const inf = info[j.id] || { pagantes: 0, bolo: 0 };
        const meu = meuPalpiteDoJogo(j.id);
        return `
          <div class="card card-bolao">
            ${cabecalhoJogo(j, inf)}
            ${meu
              ? `<div class="meu-palpite">Seu palpite: <b>${meu.palpite_casa} × ${meu.palpite_fora}</b></div>
                 ${meu.pago ? '<div class="selo-pago">✅ Confirmado — boa sorte!</div>'
                            : '<div class="selo-pendente">⏳ Pagamento não confirmado</div>'}`
              : '<p class="bolao-resultado">Os palpites deste jogo já fecharam. Aguarde o resultado!</p>'}
          </div>`;
      }).join('')}` : ''}

    ${emBreve.length ? `
      <h3 class="rodada-titulo">🔒 Ainda vai abrir</h3>
      ${emBreve.map((j) => {
        const casa = timePorId(j.casa), fora = timePorId(j.fora);
        const { abre } = janelaBolao(j);
        return `
          <div class="card card-bolao em-breve">
            <div class="bolao-topo">
              <span class="bolao-jogo">${casa.bandeira} ${casa.nome} <span class="x">×</span> ${fora.nome} ${fora.bandeira}</span>
              <span class="bolao-data">${fmtData(j.data)} · ${fmtHora(j.data)}</span>
            </div>
            <p class="abre-em">🔒 Palpites abrem <b>segunda-feira, ${fmtDiaMes(abre)}</b></p>
          </div>`;
      }).join('')}` : ''}

    ${encerrados.length
      ? `<h3 class="rodada-titulo">Resultados do bolão</h3>${encerrados.map(cardEncerrado).join('')}`
      : ''}

    <button class="btn-bolao secundario" onclick="chamarGaleraBolao()">📤 Chamar a galera no WhatsApp</button>`;
}

async function palpitarJogo(jogoId) {
  const nome = ($('#bolao-nome').value || '').trim();
  const zap = ($('#bolao-whats').value || '').trim();
  if (!nome) { alert('Digite seu nome para palpitar 🙂'); $('#bolao-nome').focus(); return; }
  if (!zap) { alert('Digite seu WhatsApp — é por ele que a organização confirma seu pagamento.'); $('#bolao-whats').focus(); return; }

  const linha = $(`.palpite-jogo[data-jogo="${jogoId}"]`);
  const [a, b] = linha.querySelectorAll('input');
  if (a.value === '' || b.value === '') { alert('Preencha o placar dos dois times ⚽'); return; }

  localStorage.setItem('bolao-nome', nome);
  localStorage.setItem('bolao-whats', zap);

  const palpite = [Number(a.value), Number(b.value)];
  const ok = await enviarPalpiteJogo(jogoId, palpite, nome, zap);
  if (!ok) { alert('Não consegui registrar seu palpite. Confira sua internet e tente de novo.'); return; }

  vibrar(60);
  festejar(false);
  await carregarPalpites();
  renderBolao();
  cobrarPix(jogoId, palpite, nome);
}

// Abre o WhatsApp da organização com o palpite e a instrução do Pix
function cobrarPix(jogoId, palpite, nome) {
  const j = JOGOS.find((x) => x.id === jogoId);
  if (!j) return;
  const meu = palpite ? null : meuPalpiteDoJogo(jogoId);
  const pc = palpite ? palpite[0] : (meu ? meu.palpite_casa : '?');
  const pf = palpite ? palpite[1] : (meu ? meu.palpite_fora : '?');
  const quem = nome || localStorage.getItem('bolao-nome') || '';
  const casa = timePorId(j.casa), fora = timePorId(j.fora);
  const pix = COPA.pixChave
    ? `\nPix (${COPA.pixNome}): ${COPA.pixChave}`
    : '\nMe passa a chave Pix, por favor 🙏';
  const texto = `🎯 *BOLÃO — II Copa Baba dos Coroas*\n`
    + `Jogo: ${casa.nome} × ${fora.nome} (${fmtData(j.data)} ${fmtHora(j.data)})\n`
    + `Meu palpite: *${pc} × ${pf}*\n`
    + `Nome: ${quem}\n`
    + `Valor: ${fmtReal(COPA.bolaoValor)}${pix}\n\n`
    + `Já envio o comprovante! ✅`;
  window.open(`https://wa.me/${COPA.bolaoWhatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
}

function chamarGaleraBolao() {
  const { acumulado } = calcularPremios();
  const texto = `🎯 *BOLÃO da II Copa Baba dos Coroas!*\n`
    + `${fmtReal(COPA.bolaoValor)} por jogo — acertou o placar exato, leva o bolo!`
    + (acumulado > 0 ? `\n🔥 ACUMULADO: ${fmtReal(acumulado)}` : '')
    + `\n\nDá o teu palpite: https://emanoel-aleixo.github.io/copa-baba-dos-coroas/`;
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

// Atalho do banner da home direto para a aba do bolão
function abrirBolao() {
  irPara('jogos');
  $('.abas button[data-aba="painel-bolao"]').click();
}

// ---------- Fotos com cadeado ----------
// Modelo dos sites de foto esportiva (Fotop/Banlek): a prévia aparece
// inteira com marca d'água repetida + leve borrão; ao tocar, abre
// ampliada com o botão de compra. A foto comprada vai em alta, limpa.
const EMOJIS_FOTO = ['⚽', '🏆', '🥅', '📸', '🎉', '🙌', '👑', '🔥'];
const MARCA_DAGUA = '© II COPA BABA DOS COROAS · '.repeat(14);

function miniaturaFoto(f, gIdx, fIdx) {
  const emoji = EMOJIS_FOTO[fIdx % EMOJIS_FOTO.length];
  const visual = f.src
    ? `<img class="img-foto" src="${f.src}" alt="${f.legenda}" loading="lazy">`
    : `<div class="simulada">${emoji}</div>`;

  if (f.liberada) {
    return `
      <div class="foto" onclick="verFoto(${gIdx}, ${fIdx})">
        ${visual}
        <span class="badge-gratis">GRÁTIS</span>
        <div class="rodape-foto"><span>${f.legenda}</span></div>
      </div>`;
  }
  return `
    <div class="foto trancada" onclick="verFoto(${gIdx}, ${fIdx})">
      ${visual}
      <div class="marca-dagua" aria-hidden="true">${MARCA_DAGUA}</div>
      <span class="badge-cadeado">🔒</span>
      <div class="rodape-foto"><span>${f.legenda}</span><span class="preco">${COPA.precoFoto}</span></div>
    </div>`;
}

function renderFotos() {
  $('#galerias-fotos').innerHTML = FOTOS.length ? FOTOS.map((g, gIdx) => `
    <h3 class="rodada-titulo">📸 ${g.titulo}</h3>
    <div class="grade-fotos">
      ${g.fotos.map((f, fIdx) => miniaturaFoto(f, gIdx, fIdx)).join('')}
    </div>`).join('') : '<p class="vazio">As fotos aparecem aqui depois de cada rodada.</p>';
}

// Amplia a foto (com marca d'água se ainda bloqueada) antes da compra
function verFoto(gIdx, fIdx) {
  const galeria = FOTOS[gIdx];
  const f = galeria.fotos[fIdx];
  const emoji = EMOJIS_FOTO[fIdx % EMOJIS_FOTO.length];
  const visual = f.src
    ? `<img class="img-foto" src="${f.src}" alt="${f.legenda}">`
    : `<div class="simulada">${emoji}</div>`;

  $('#modal-foto').innerHTML = `
    <div class="modal-conteudo" onclick="event.stopPropagation()">
      <div class="modal-img ${f.liberada ? '' : 'trancada'}">
        ${visual}
        ${f.liberada ? '' : `<div class="marca-dagua" aria-hidden="true">${MARCA_DAGUA}</div>`}
      </div>
      <p class="modal-legenda">${f.legenda} — <b>${galeria.titulo}</b></p>
      ${f.liberada
        ? '<p class="modal-obs">✅ Amostra grátis desta galeria.</p>'
        : `<button class="btn-comprar" onclick="comprarFoto('${f.id}', '${galeria.titulo.replace(/'/g, '')}')">
             💬 Comprar por ${COPA.precoFoto} no WhatsApp (Pix)
           </button>
           <p class="modal-obs">Após o pagamento, você recebe a foto em <b>alta resolução, sem marca d'água e sem borrão</b>.</p>`}
      <button class="btn-fechar" onclick="fecharFoto()">Fechar</button>
    </div>`;
  $('#modal-foto').classList.add('aberto');
}

function fecharFoto() {
  $('#modal-foto').classList.remove('aberto');
}

function comprarFoto(id, jogo) {
  const msg = encodeURIComponent(`Olá! Quero comprar a foto ${id} do jogo "${jogo}" da II Copa Baba dos Coroas (${COPA.precoFoto}). Como faço o Pix?`);
  window.open(`https://wa.me/${COPA.whatsappFotos}?text=${msg}`, '_blank');
}

// ---------- Vídeos ----------
function renderVideos() {
  $('#lista-videos').innerHTML = VIDEOS.map((v) => `
    <div class="card card-video">
      <div class="thumb">▶️</div>
      <h3>${v.titulo}</h3>
      <p>${v.desc}</p>
    </div>`).join('');
}

// ---------- Patrocinadores ----------
// Preenche todas as grades (home e página Nossos Patrocinadores)
function renderPatrocinadores() {
  const html = PATROCINADORES.map((p) => {
    const ico = p.destaque ? '👑' : '🤝';
    const visual = p.logo
      ? `<img class="logo-patro-img" src="${p.logo}" alt="${p.nome}" loading="lazy" onerror="this.outerHTML='<div class=&quot;logo-patro&quot;>${ico}</div>'">`
      : `<div class="logo-patro">${ico}</div>`;
    return `
    <div class="card-patro ${p.destaque ? 'destaque' : ''}">
      ${visual}
      <h3>${p.nome}</h3>
      <p>${p.desc}</p>
    </div>`;
  }).join('');
  $$('.grade-patro').forEach((g) => { g.innerHTML = html; });
}

// ---------- Home: próximo jogo + últimos resultados ----------
function renderHome() {
  const temConfirmada = (j) => timePorId(j.casa)?.confirmada || timePorId(j.fora)?.confirmada;
  const semJogo = JOGOS.filter((j) => !j.placar && j.casa && j.fora);
  // Prioriza jogos com pelo menos uma seleção já confirmada (evita "A definir × A definir")
  const proximos = [...semJogo.filter(temConfirmada), ...semJogo.filter((j) => !temConfirmada(j))].slice(0, 2);
  const ultimos = JOGOS.filter((j) => j.placar).slice(-2).reverse();

  $('#proximos-jogos').innerHTML = proximos.length
    ? proximos.map(cardJogo).join('')
    : '<p class="vazio">Tabela de jogos em breve!</p>';
  $('#ultimos-resultados').innerHTML = ultimos.length
    ? ultimos.map(cardJogo).join('')
    : '<p class="vazio">A copa ainda não começou! Fique de olho na tabela. ⚽</p>';

  const confirmadas = SELECOES.filter((s) => s.confirmada);
  const faltam = SELECOES.length - confirmadas.length;
  $('#lideres').innerHTML = confirmadas.map((s) => `
    <div class="stat">
      <div class="v">${s.bandeira}</div>
      <div class="r">${s.nome}</div>
      <div class="ok">✅</div>
    </div>`).join('') + (faltam > 0 ? `
    <div class="stat" style="opacity:.65">
      <div class="v">❔</div>
      <div class="r">+${faltam} no sorteio</div>
    </div>` : '');
}

// ---------- "Cara de app": tutorial + instalar ----------
const estaInstalado = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true ||
  localStorage.getItem('pwa-instalado') === '1';
const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

// Tutorial de boas-vindas (só na 1ª visita)
function iniciarOnboarding() {
  const ob = $('#onboarding');
  if (!ob || localStorage.getItem('onboarding-visto')) { mostrarBannerInstalar(); return; }

  const slides = [...ob.querySelectorAll('.ob-slide')];
  const dots = $('#ob-dots');
  dots.innerHTML = slides.map((_, i) => `<span class="ob-dot ${i === 0 ? 'on' : ''}"></span>`).join('');
  let i = 0;

  const mostra = (n) => {
    slides.forEach((s, k) => s.classList.toggle('ativa', k === n));
    dots.querySelectorAll('.ob-dot').forEach((d, k) => d.classList.toggle('on', k === n));
    $('#ob-proximo').textContent = n === slides.length - 1 ? 'Começar 🎉' : 'Próximo →';
  };
  const fechar = () => {
    localStorage.setItem('onboarding-visto', '1');
    ob.classList.remove('aberto');
    mostrarBannerInstalar();
  };

  $('#ob-proximo').onclick = () => { i < slides.length - 1 ? mostra(++i) : fechar(); };
  $('#ob-pular').onclick = fechar;

  ob.classList.add('aberto');
}

// Banner "Instalar app" (Android usa o prompt nativo; iPhone mostra instruções)
function mostrarBannerInstalar() {
  const banner = $('#install-banner');
  if (!banner || estaInstalado() || localStorage.getItem('install-dispensado')) return;

  const abrir = () => banner.classList.add('aberto');

  if (window.__promptInstalar) abrir();
  else if (ehIOS()) { $('#ib-sub').textContent = 'Toque para ver como instalar'; abrir(); }
  else window.addEventListener('pwa-instalavel', abrir, { once: true });

  $('#btn-instalar').onclick = async () => {
    if (window.__promptInstalar) {
      window.__promptInstalar.prompt();
      await window.__promptInstalar.userChoice;
      window.__promptInstalar = null;
      banner.classList.remove('aberto');
    } else if (ehIOS()) {
      $('#modal-ios').classList.add('aberto');
    }
  };
  $('#btn-fechar-install').onclick = () => {
    banner.classList.remove('aberto');
    localStorage.setItem('install-dispensado', '1');
  };
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
  // Menu de baixo PRIMEIRO — garante que a navegação sempre funcione,
  // mesmo que algo abaixo dê erro.
  $$('.nav-inferior button').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.secao)));

  try { iniciarOnboarding(); } catch (e) { mostrarBannerInstalar(); }

  $$('.abas button').forEach((b) => b.addEventListener('click', () => {
    const grupoAbas = b.closest('.abas');
    grupoAbas.querySelectorAll('button').forEach((x) => x.classList.remove('ativa'));
    b.classList.add('ativa');
    const alvoId = b.dataset.aba;
    grupoAbas.parentElement.querySelectorAll('.painel-aba').forEach((p) => {
      p.style.display = p.id === alvoId ? 'block' : 'none';
    });
  }));

  atualizaContagem();
  setInterval(atualizaContagem, 1000);

  renderHome();
  renderJogos();
  renderBolao();
  renderClassificacao();
  renderRankings();
  renderSelecoes();
  renderAlbum();
  renderFotos();
  renderVideos();
  renderPatrocinadores();

  $('#btn-pacote').addEventListener('click', abrirPacote);

  // Dados ao vivo do Supabase (resultados oficiais + fotos liberadas);
  // se conseguir, redesenha tudo por cima do modo local
  Promise.all([carregarAoVivo(), carregarPalpites()]).then(([ok]) => {
    if (ok) {
      renderHome();
      renderJogos();
      renderClassificacao();
      renderRankings();
      renderSelecoes();
      renderAlbum();
      renderFotos();
    }
    renderBolao(); // sempre redesenha: prêmios/pagamentos vêm do servidor

    // Resultado novo desde a última visita? Confete de boas-vindas.
    const jogados = JOGOS.filter((j) => j.placar).length;
    const vistos = Number(localStorage.getItem('resultados-vistos') || 0);
    if (jogados > vistos) {
      localStorage.setItem('resultados-vistos', String(jogados));
      if (vistos > 0) setTimeout(() => festejar(false), 900); // não festeja na 1ª visita
    }
  });
});
