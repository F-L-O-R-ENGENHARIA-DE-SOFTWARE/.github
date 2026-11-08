/*
 * Arquivo: js/lista-opcoes.js
 * Função: faz a lista de opções escura dos filtros funcionar como um select: escolher uma opção, mostrar o texto no botão e guardar o valor.
 * Usado por: movimentacoes.html, visao-geral.html e estados.html, ligado depois de estados-interface.js (ele abre e fecha o popover).
 *
 * Não filtra nada: só troca o texto do botão, o valor do campo escondido e o aria-selected. Quem filtra é a equipe de JS.
 * [INTEGRAÇÃO-JS] O campo escondido (id em data-campo) dispara o evento "change" a cada escolha; ouça esse evento para aplicar o filtro.
 * [INTEGRAÇÃO-JS] Para voltar ao padrão (botão Limpar): window.TexpandInterface.escolherOpcao("js-filtro-tipo", "todos").
 */
(function () {
  "use strict";

  // ===== [BUSCA] =====
  function itensDa(lista) {
    return Array.prototype.slice.call(lista.querySelectorAll(".lista-opcoes__item"));
  }

  function gatilhoDa(lista) {
    return document.querySelector('[aria-controls="' + lista.id + '"]');
  }

  // ===== [ESCOLHA] =====
  // Marca a opção, atualiza o texto do botão e o campo escondido. Sem fechar a lista (quem chama decide).
  function marcarOpcao(lista, item) {
    itensDa(lista).forEach(function (outro) {
      var ativo = outro === item;
      outro.classList.toggle("lista-opcoes__item--ativo", ativo);
      outro.setAttribute("aria-selected", String(ativo));
    });
    var resumo = document.getElementById(lista.dataset.resumo);
    if (resumo) resumo.textContent = item.textContent;
    var campo = document.getElementById(lista.dataset.campo);
    if (campo && campo.value !== item.dataset.valor) {
      campo.value = item.dataset.valor;
      campo.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function escolherOpcao(idCampo, valor) {
    var lista = document.querySelector('[data-js="lista-opcoes"][data-campo="' + idCampo + '"]');
    if (!lista) return;
    var item = itensDa(lista).filter(function (opcao) { return opcao.dataset.valor === valor; })[0];
    if (item) marcarOpcao(lista, item);
  }

  function escolherEFechar(item) {
    var lista = item.closest('[data-js="lista-opcoes"]');
    var gatilho = gatilhoDa(lista);
    marcarOpcao(lista, item);
    window.TexpandInterface.fecharJanela(lista);
    if (gatilho) gatilho.focus();
  }

  // ===== [FOCO] =====
  // Ao abrir, o foco vai para a opção escolhida, para navegar com as setas.
  function focarOpcaoAtiva(gatilho) {
    var lista = document.getElementById(gatilho.getAttribute("aria-controls"));
    if (!lista || lista.hidden) return;
    var ativa = lista.querySelector(".lista-opcoes__item--ativo") || itensDa(lista)[0];
    if (ativa) ativa.focus();
  }

  function fecharListasAbertas() {
    document.querySelectorAll('[data-js="lista-opcoes"]:not([hidden])').forEach(function (lista) {
      window.TexpandInterface.fecharJanela(lista);
    });
  }

  // ===== [EVENTOS] =====
  document.addEventListener("click", function (evento) {
    var item = evento.target.closest(".lista-opcoes__item");
    if (item) {
      escolherEFechar(item);
      return;
    }
    var gatilho = evento.target.closest('[aria-haspopup="listbox"]');
    if (gatilho) {
      setTimeout(function () { focarOpcaoAtiva(gatilho); }, 0); // espera o estados-interface abrir o popover
      return;
    }
    if (!evento.target.closest(".lista-suspensa")) fecharListasAbertas();
  });

  document.addEventListener("keydown", function (evento) {
    var item = evento.target.closest && evento.target.closest(".lista-opcoes__item");
    if (!item) return;
    var itens = itensDa(item.closest(".lista-opcoes"));
    var posicao = itens.indexOf(item);
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      escolherEFechar(item);
    } else if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      var proximo = evento.key === "ArrowDown" ? posicao + 1 : posicao - 1;
      if (itens[proximo]) itens[proximo].focus();
    }
  });

  window.TexpandInterface.escolherOpcao = escolherOpcao;
})();
