/*
 * Arquivo: js/estados-interface.js
 * Função: alterna estados visuais da interface (janelas, popovers, senha, tipo, menu e navegação provisória). Não mexe em dados.
 * Usado por: todas as páginas, ligado no fim do body com defer.
 *
 * Para a equipe de JS: window.TexpandInterface expõe três funções (aceitam o id ou o elemento).
 *   abrirJanela(alvo, gatilho)   abre um <dialog> com showModal() ou mostra um popover
 *   fecharJanela(alvo)           fecha o <dialog> ou esconde o popover
 *   alternarPopover(alvo, gatilho) mostra o popover se estiver escondido; senão esconde
 * Os ganchos lidos daqui estão na seção "Ganchos para JavaScript e banco" da DOCUMENTACAO.md.
 */
(function () {
  "use strict";

  var ultimoGatilho = null; // botão que abriu o último dialog, para devolver o foco ao fechar

  // ===== [BUSCA] =====
  function obterElemento(alvo) {
    if (!alvo) return null;
    return typeof alvo === "string" ? document.getElementById(alvo) : alvo;
  }

  function ehDialogo(elemento) {
    return elemento && elemento.tagName === "DIALOG";
  }

  // ===== [JANELAS: DIALOG E POPOVER] =====
  // O popover é mostrado ou escondido pelo atributo hidden; o botão guarda o estado em aria-expanded.
  function atualizarGatilho(popover, expandido) {
    var gatilho = document.querySelector('[aria-controls="' + popover.id + '"]');
    if (gatilho) gatilho.setAttribute("aria-expanded", String(expandido));
    return gatilho;
  }

  function fecharJanela(alvo) {
    var janela = obterElemento(alvo);
    if (!janela) return;
    if (ehDialogo(janela)) {
      if (janela.open) janela.close();
      return;
    }
    janela.querySelectorAll('.popover:not([hidden])').forEach(function (filho) {
      filho.hidden = true;
      atualizarGatilho(filho, false);
    });
    janela.hidden = true;
    atualizarGatilho(janela, false);
  }

  // Fecha os popovers abertos, menos o indicado. Com devolverFoco, volta o foco ao botão do popover.
  function fecharPopovers(exceto, devolverFoco) {
    var abertos = document.querySelectorAll('[aria-controls][aria-expanded="true"]');
    abertos.forEach(function (gatilho) {
      var popover = obterElemento(gatilho.getAttribute("aria-controls"));
      if (!popover || popover === exceto || !popover.classList.contains("popover")) return;
      if (exceto && popover.contains(exceto)) return; // lista aberta dentro do painel de filtro: o painel continua aberto
      fecharJanela(popover);
      if (devolverFoco) gatilho.focus();
    });
  }

  function abrirJanela(alvo, gatilho) {
    var janela = obterElemento(alvo);
    if (!janela) return;
    if (ehDialogo(janela)) {
      ultimoGatilho = gatilho || null;
      if (!janela.open) janela.showModal();
      return;
    }
    fecharPopovers(janela, false);
    janela.hidden = false;
    atualizarGatilho(janela, true);
  }

  function alternarPopover(alvo, gatilho) {
    var popover = obterElemento(alvo);
    if (!popover) return;
    if (popover.hidden) abrirJanela(popover, gatilho);
    else fecharJanela(popover);
  }

  // Modo editar: o título troca pelo texto de data-titulo-editar; sem data-modo, volta ao original.
  function ajustarTitulo(dialogo, modo) {
    var titulo = dialogo.querySelector("[data-titulo-editar]");
    if (!titulo) return;
    if (titulo.dataset.tituloOriginal === undefined) titulo.dataset.tituloOriginal = titulo.textContent;
    titulo.textContent = modo === "editar" ? titulo.dataset.tituloEditar : titulo.dataset.tituloOriginal;
    // [INTEGRAÇÃO-JS] Preencher os campos do modal com a movimentação da linha quando for o modo editar.
  }

  // ===== [AÇÕES POR data-js] =====
  function acaoAbrir(botao) {
    var janela = obterElemento(botao.dataset.alvo);
    if (!janela) return;
    if (ehDialogo(janela)) ajustarTitulo(janela, botao.dataset.modo);
    abrirJanela(janela, botao);
  }

  function acaoAlternar(botao) {
    alternarPopover(botao.dataset.alvo, botao);
  }

  function acaoFechar(botao) {
    fecharJanela(botao.closest("dialog, .popover"));
  }

  function acaoAlternarSenha(botao) {
    var campo = obterElemento(botao.dataset.alvo);
    if (!campo) return;
    var vaiMostrar = campo.type === "password";
    campo.type = vaiMostrar ? "text" : "password";
    botao.setAttribute("aria-label", vaiMostrar ? "Ocultar senha" : "Mostrar senha");
  }

  // Alternador Entrada/Saída (modal e painel de filtro): só um botão fica marcado por grupo.
  function acaoTipo(botao) {
    var grupo = botao.closest(".alternador-tipo");
    if (!grupo) return;
    grupo.querySelectorAll('[data-js="tipo-lancamento"]').forEach(function (irmao) {
      irmao.setAttribute("aria-pressed", String(irmao === botao));
    });
  }

  // Menu lateral no modo de até 700 px.
  function acaoMenu(botao) {
    var barra = obterElemento(botao.dataset.alvo);
    if (!barra) return;
    var aberto = barra.classList.toggle("barra-lateral--aberta");
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  }

  var acoes = {
    "abrir": acaoAbrir,
    "alternar": acaoAlternar,
    "fechar": acaoFechar,
    "alternar-senha": acaoAlternarSenha,
    "tipo-lancamento": acaoTipo,
    "alternar-menu": acaoMenu
  };

  // ===== [EVENTOS] =====
  document.addEventListener("click", function (evento) {
    var alvo = evento.target;
    // Clique no fundo escurecido: o alvo é o próprio dialog, que não tem preenchimento.
    if (ehDialogo(alvo)) {
      fecharJanela(alvo);
      return;
    }
    var gatilho = alvo.closest("[data-js]");
    var acao = gatilho && acoes[gatilho.dataset.js];
    if (acao) acao(gatilho);
    // Clique fora de qualquer popover ou botão que controla uma janela fecha os popovers abertos.
    if (!alvo.closest(".popover, [aria-controls]")) fecharPopovers(null, false);
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      fecharPopovers(null, true);
      var menu = document.querySelector('.barra-lateral--aberta');
      if (menu) {
        menu.classList.remove('barra-lateral--aberta');
        var botao = document.querySelector('[data-js="alternar-menu"]');
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-label', 'Abrir menu');
        botao.focus();
      }
    } // o dialog já fecha sozinho com Esc
  });

  // O evento close não borbulha; a captura devolve o foco ao botão que abriu o dialog.
  document.addEventListener("close", function (evento) {
    if (!ultimoGatilho || !ehDialogo(evento.target)) return;
    ultimoGatilho.focus();
    ultimoGatilho = null;
  }, true);

  window.TexpandInterface = {
    abrirJanela: abrirJanela,
    fecharJanela: fecharJanela,
    alternarPopover: alternarPopover
  };
})();
