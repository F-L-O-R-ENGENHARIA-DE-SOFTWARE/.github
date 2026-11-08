/* Arquivo: js/tema.js
 * Função: aplicar o tema antes da pintura e manter a preferência entre páginas.
 * Usado por: todas as páginas, no head, sem defer. Armazena apenas a preferência visual.
 * O parâmetro tema também mantém a escolha na navegação direta por arquivos locais. */
(function () {
  "use strict";
  var chave = "texpand-tema";
  var raiz = document.documentElement;
  function valido(valor) { return valor === "claro" || valor === "escuro"; }
  var parametro = new URLSearchParams(window.location.search).get("tema");
  var guardado = null;
  try { guardado = localStorage.getItem(chave); } catch (erro) { /* Preferência segue na URL. */ }
  var atual = valido(parametro) ? parametro : (valido(guardado) ? guardado : "claro");
  function endereco(href) {
    var url = new URL(href, window.location.href);
    if (url.protocol === "file:" || url.origin === window.location.origin) url.searchParams.set("tema", atual);
    return url.href;
  }
  function sincronizar() {
    document.querySelectorAll('[name="tema"]').forEach(function (radio) { radio.checked = radio.value === atual; });
    document.querySelectorAll('[data-js="alternar-tema"]').forEach(function (botao) {
      botao.textContent = atual === "escuro" ? "Modo claro" : "Modo escuro";
      botao.setAttribute("aria-label", atual === "escuro" ? "Ativar modo claro" : "Ativar modo escuro");
      botao.setAttribute("aria-pressed", String(atual === "escuro"));
    });
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && !href.startsWith("#") && /\.html(?:[?#]|$)/.test(href)) {
        var destino = new URL(href, window.location.href);
        if (destino.protocol === "file:" || destino.origin === window.location.origin) link.href = endereco(href);
      }
    });
  }
  function aplicar(tema, salvar) {
    if (!valido(tema)) return;
    atual = tema;
    raiz.dataset.tema = atual;
    raiz.style.colorScheme = atual === "escuro" ? "dark" : "light";
    if (salvar !== false) {
      try { localStorage.setItem(chave, atual); } catch (erro) { /* Sem dependência de storage. */ }
    }
    try { history.replaceState(null, "", endereco(window.location.href)); } catch (erro) { /* file:// pode restringir history. */ }
    sincronizar();
  }
  aplicar(atual, false);
  // Preserva a preferência quando index.html usa o redirecionamento estático.
  var redirecionamento = document.querySelector('meta[http-equiv="refresh"]');
  if (redirecionamento) redirecionamento.content = "0; url=" + endereco("login.html");
  document.addEventListener("DOMContentLoaded", sincronizar);
  document.addEventListener("change", function (evento) {
    if (evento.target.matches('[name="tema"]')) aplicar(evento.target.value);
  });
  document.addEventListener("click", function (evento) {
    if (evento.target.closest('[data-js="alternar-tema"]')) aplicar(atual === "escuro" ? "claro" : "escuro");
  });
  window.addEventListener("storage", function (evento) {
    if (evento.key === chave && valido(evento.newValue)) aplicar(evento.newValue, false);
  });
  window.TexpandTema = { aplicar: aplicar, endereco: endereco };
})();
