// ============================================================
// II COPA BABA DOS COROAS — lógica do app
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

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
function irPara(secao) {
  $$('.secao').forEach((s) => s.classList.remove('ativa'));
  $(`#secao-${secao}`).classList.add('ativa');
  $$('.nav-inferior button').forEach((b) => b.classList.toggle('ativa', b.dataset.secao === secao));
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
        ${s.elenco.map((j) => `<li><span class="num">${j.n}</span> ${j.nome} <span class="pos-tag">${j.pos}</span></li>`).join('')}
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
    return `
    <div class="figurinha colada ${rara ? 'rara' : ''}">
      <span class="rosto">${f.selecao.bandeira}</span>
      <b>${f.jogador.nome}</b>
      <span>#${f.jogador.n} · ${f.selecao.nome}</span>
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

  const raras = figurinhasRaras();
  $('#album-grades').innerHTML = comElenco.map((s) => `
    <h3 class="rodada-titulo">${s.bandeira} ${s.nome}</h3>
    <div class="grade-figurinhas">
      ${s.elenco.map((j) => {
        const chave = `${s.id}-${j.n}`;
        const qtd = album[chave] || 0;
        const rara = qtd && raras.has(chave);
        return qtd
          ? `<div class="figurinha colada ${rara ? 'rara' : ''}">${qtd > 1 ? `<span class="rep">×${qtd}</span>` : ''}<span class="rosto">${s.bandeira}</span><b>${j.nome}</b><span>#${j.n}</span>${rara ? '<span class="selo-rara">⚽ ARTILHEIRO</span>' : ''}</div>`
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

function pontosDoPalpite(jogo, palpite) {
  if (!jogo.placar || !palpite) return null;
  const [ra, rf] = jogo.placar;
  const [pa, pf] = palpite;
  if (ra === pa && rf === pf) return 3;
  if (Math.sign(ra - rf) === Math.sign(pa - pf)) return 1;
  return 0;
}

function renderBolao() {
  const palpites = lerPalpites();
  const nome = localStorage.getItem('bolao-nome') || '';

  // Só entram no bolão jogos entre seleções já confirmadas (ambas sorteadas)
  const confirmado = (id) => { const t = timePorId(id); return t && t.confirmada; };
  const abertos = JOGOS.filter((j) => !j.placar && j.casa && j.fora
    && confirmado(j.casa) && confirmado(j.fora) && new Date(j.data) > new Date());
  const encerrados = JOGOS.filter((j) => j.placar && palpites[j.id]);
  const total = encerrados.reduce((acc, j) => acc + pontosDoPalpite(j, palpites[j.id]), 0);

  const linhaPalpite = (j) => {
    const casa = timePorId(j.casa);
    const fora = timePorId(j.fora);
    const p = palpites[j.id] || ['', ''];
    return `
      <div class="palpite-jogo" data-jogo="${j.id}">
        <span class="time">${casa.bandeira}<br>${casa.nome}</span>
        <input type="number" min="0" max="30" inputmode="numeric" value="${p[0]}" aria-label="Gols ${casa.nome}">
        <span class="x">×</span>
        <input type="number" min="0" max="30" inputmode="numeric" value="${p[1]}" aria-label="Gols ${fora.nome}">
        <span class="time">${fora.bandeira}<br>${fora.nome}</span>
      </div>`;
  };

  const porRodada = {};
  abertos.forEach((j) => {
    (porRodada[`Rodada ${j.rodada}`] = porRodada[`Rodada ${j.rodada}`] || []).push(j);
  });

  const historico = encerrados.map((j) => {
    const casa = timePorId(j.casa);
    const fora = timePorId(j.fora);
    const pts = pontosDoPalpite(j, palpites[j.id]);
    const icone = pts === 3 ? '🎯' : pts === 1 ? '✅' : '❌';
    return `
      <li>
        <span class="medalha">${icone}</span>
        <span class="info"><b>${casa.bandeira} ${j.placar[0]}×${j.placar[1]} ${fora.bandeira}</b><br>
        <span class="t">seu palpite: ${palpites[j.id][0]}×${palpites[j.id][1]}</span></span>
        <span class="valor">${pts} pt${pts === 1 ? '' : 's'}</span>
      </li>`;
  }).join('');

  $('#conteudo-bolao').innerHTML = `
    <div class="card album-progresso">
      <span class="chip">🎯 Bolão da Copa</span>
      <p style="margin-top:10px; font-size:13px; line-height:1.6">
        Acerte o <b>placar exato</b>: 3 pontos · acerte só o <b>vencedor (ou empate)</b>: 1 ponto.<br>
        Pode mudar o palpite até a bola rolar!
      </p>
      <input class="campo-nome" id="bolao-nome" type="text" maxlength="30"
             placeholder="Seu nome ou apelido de palpiteiro" value="${escapaHtml(nome)}">
    </div>

    <div id="ranking-bolao"></div>

    ${encerrados.length ? `
      <div class="card">
        <span class="chip">Meus pontos: ${total}</span>
        <ol class="rank-lista" style="margin-top:8px">${historico}</ol>
        <p class="subtitulo" style="margin:10px 0 0">🏆 O ranking geral entre todos os palpiteiros vem em breve!</p>
      </div>` : ''}

    ${Object.entries(porRodada).map(([rodada, jogos]) => `
      <h3 class="rodada-titulo">${rodada}</h3>
      ${jogos.map(linhaPalpite).join('')}
    `).join('')}

    ${abertos.length ? `
      <button class="btn-bolao" onclick="salvarPalpites()">💾 Salvar meus palpites</button>
      <button class="btn-bolao secundario" onclick="compartilharPalpites()">📤 Desafiar a galera no WhatsApp</button>
    ` : '<p class="vazio">Nenhum jogo aberto para palpites no momento.</p>'}`;

  renderRankingBolao(); // preenche o ranking geral (assíncrono, via Supabase)
}

async function renderRankingBolao() {
  const alvo = $('#ranking-bolao');
  if (!alvo) return;
  const ranking = await buscarRankingBolao();
  if (ranking === null) { alvo.innerHTML = ''; return; } // servidor indisponível: segue no modo local

  if (!ranking.length) {
    alvo.innerHTML = `
      <div class="card">
        <span class="chip">🏆 Ranking geral</span>
        <p class="vazio">Ninguém palpitou ainda — seja o primeiro!</p>
      </div>`;
    return;
  }

  const medalhas = ['🥇', '🥈', '🥉'];
  alvo.innerHTML = `
    <div class="card">
      <span class="chip">🏆 Ranking geral dos palpiteiros</span>
      <ol class="rank-lista" style="margin-top:8px">
        ${ranking.slice(0, 20).map((p, i) => `
          <li class="${p.souEu ? 'sou-eu' : ''}">
            <span class="medalha">${medalhas[i] || i + 1}</span>
            <span class="info"><b>${escapaHtml(p.nome)}${p.souEu ? ' (você)' : ''}</b><br>
            <span class="t">${p.exatos} exato${p.exatos === 1 ? '' : 's'} · ${p.palpites} palpite${p.palpites === 1 ? '' : 's'}</span></span>
            <span class="valor">${p.pts} pts</span>
          </li>`).join('')}
      </ol>
    </div>`;
}

function salvarPalpites() {
  const nome = $('#bolao-nome').value.trim();
  if (nome) localStorage.setItem('bolao-nome', nome);

  const palpites = lerPalpites();
  let qtd = 0;
  $$('#conteudo-bolao .palpite-jogo').forEach((linha) => {
    const [a, b] = linha.querySelectorAll('input');
    if (a.value !== '' && b.value !== '') {
      palpites[linha.dataset.jogo] = [Number(a.value), Number(b.value)];
      qtd++;
    }
  });

  localStorage.setItem('bolao-palpites', JSON.stringify(palpites));
  vibrar(60);
  if (qtd) festejar(false);
  renderBolao();

  // envia para o bolão geral e atualiza o ranking
  enviarPalpitesNuvem(palpites, nome).then(() => renderRankingBolao());
}

function compartilharPalpites() {
  const palpites = lerPalpites();
  const nome = localStorage.getItem('bolao-nome') || 'Palpiteiro misterioso';
  const linhas = JOGOS
    .filter((j) => !j.placar && j.casa && palpites[j.id])
    .map((j) => {
      const [a, b] = palpites[j.id];
      const casa = timePorId(j.casa);
      const fora = timePorId(j.fora);
      return `${casa.bandeira} ${casa.nome} ${a}×${b} ${fora.nome} ${fora.bandeira}`;
    });

  const texto = linhas.length
    ? `🎯 Palpites de ${nome} no BOLÃO da II Copa Baba dos Coroas:\n\n${linhas.join('\n')}\n\nDuvida? Faça o seu: https://copababadoscoroas.netlify.app`
    : `🎯 Bora dar seus palpites no BOLÃO da II Copa Baba dos Coroas!\nhttps://copababadoscoroas.netlify.app`;

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
  const html = PATROCINADORES.map((p) => `
    <div class="card-patro ${p.destaque ? 'destaque' : ''}">
      <div class="logo-patro">${p.destaque ? '👑' : '🤝'}</div>
      <h3>${p.nome}</h3>
      <p>${p.desc}</p>
    </div>`).join('');
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
  $('#lideres').innerHTML = confirmadas.map((s) => `
    <div class="stat">
      <div class="v">${s.bandeira}</div>
      <div class="r">${s.nome} ✅</div>
    </div>`).join('') + `
    <div class="stat" style="opacity:.65">
      <div class="v">❔</div>
      <div class="r">+${SELECOES.length - confirmadas.length} no sorteio</div>
    </div>`;
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
  $$('.nav-inferior button').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.secao)));

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
  carregarAoVivo().then((ok) => {
    if (ok) {
      renderHome();
      renderJogos();
      renderBolao();
      renderClassificacao();
      renderRankings();
      renderSelecoes();
      renderAlbum();
      renderFotos();
    }

    // Resultado novo desde a última visita? Confete de boas-vindas.
    const jogados = JOGOS.filter((j) => j.placar).length;
    const vistos = Number(localStorage.getItem('resultados-vistos') || 0);
    if (jogados > vistos) {
      localStorage.setItem('resultados-vistos', String(jogados));
      if (vistos > 0) setTimeout(() => festejar(false), 900); // não festeja na 1ª visita
    }
  });
});
