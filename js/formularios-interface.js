/* Arquivo: js/formularios-interface.js
 * Função: demonstra os estados dos formulários sem autenticar, gravar ou processar dados financeiros.
 * Usado por: páginas do produto. Remover/substituir estes interceptadores na integração real.
 * Não usa banco, fetch, cookies ou armazenamento local. */
(function () {
  "use strict";
  var ui = window.TexpandInterface;
  var moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  function porId(id) { return document.getElementById(id); }
  function avisar(texto) {
    var aviso = porId("js-mensagem-interface");
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.id = "js-mensagem-interface";
      aviso.className = "mensagem-interface";
      aviso.setAttribute("role", "status");
      aviso.setAttribute("aria-live", "polite");
      aviso.setAttribute("aria-atomic", "true");
    }
    // Dentro do dialog ativo para não ficar atrás do backdrop nem fora da árvore acessível.
    var dialogo = document.querySelector("dialog[open] .modal__conteudo");
    (dialogo || document.body).appendChild(aviso);
    aviso.textContent = texto;
  }
  function validar(form) {
    var senha = form.querySelector('[name="senha"], [name="senha_nova"]');
    var confirmacao = form.querySelector('[name="confirmar_senha"], [name="senha_confirmacao"]');
    if (confirmacao) confirmacao.setCustomValidity(senha.value !== confirmacao.value ? "As senhas não coincidem." : "");
    var primeiro = null;
    form.querySelectorAll("input, select").forEach(function (input) {
      if (input.type === "text") input.setCustomValidity(input.required && !input.value.trim() ? "Dados preenchidos incompletos" : "");
      var invalido = input.willValidate && !input.validity.valid;
      input.setAttribute("aria-invalid", String(invalido));
      var campo = input.closest(".campo");
      var mensagem = campo && campo.querySelector(".campo__mensagem");
      if (campo) campo.classList.toggle("campo--erro", invalido);
      if (mensagem) mensagem.textContent = input.validity.valueMissing ? "Dados preenchidos incompletos" : (input.validationMessage || "Dados preenchidos inválidos");
      if (invalido && !primeiro) primeiro = input;
    });
    var erro = form.querySelector('[data-dado="mensagem-erro"]');
    if (erro) {
      erro.hidden = !primeiro;
      var texto = primeiro && (primeiro.validity.valueMissing ? "Dados preenchidos incompletos" : "Dados preenchidos inválidos");
      var span = erro.querySelector("span");
      if (span) span.textContent = texto;
      else if (primeiro) erro.textContent = texto;
    }
    if (primeiro) {
      avisar(primeiro.validationMessage || "Revise os campos indicados.");
      primeiro.focus();
      return false;
    }
    return true;
  }
  document.addEventListener("input", function (evento) {
    var campo = evento.target.closest(".campo");
    if (campo) campo.classList.remove("campo--erro");
    evento.target.removeAttribute("aria-invalid");
    if (evento.target.setCustomValidity) evento.target.setCustomValidity("");
  });

  // Os formulários são demonstrações: impedir inclusive submissões GET que colocariam valores na URL.
  document.addEventListener("submit", function (evento) {
    var form = evento.target;
    evento.preventDefault();
    if (!validar(form)) return;
    var acao = form.dataset.js;
    if (form.dataset.destinoProvisorio) {
      window.location.href = window.TexpandTema ? window.TexpandTema.endereco(form.dataset.destinoProvisorio) : form.dataset.destinoProvisorio;
    } else if (acao === "formulario-recuperacao" || acao === "formulario-cadastro") {
      form.hidden = true;
      porId(form.dataset.alvo).hidden = false;
    } else if (acao === "formulario-filtro" || acao === "formulario-filtros") {
      var janela = form.closest(".popover");
      if (janela) ui.fecharJanela(janela);

    } else if (acao === "formulario-importar") {
      var arquivo = form.querySelector('[type="file"]').files[0];
      if (!arquivo || !/\.(csv|xlsx)$/i.test(arquivo.name)) {
        avisar("Selecione um arquivo CSV ou Excel (.xlsx).");
        return;
      }
      avisar("Serviço de importação indisponível no momento.");
    } else {
      avisar(acao === "formulario-lancamento" ? "Não foi possível salvar a movimentação. Serviço indisponível." : "Não foi possível salvar as alterações. Serviço indisponível.");
    }
  });

  var iniciais = new Map();
  var resumosIniciais = new Map();
  document.querySelectorAll('#resumo-valor, #resumo-periodo').forEach(function (resumo) { resumosIniciais.set(resumo.id, resumo.textContent); });
  document.querySelectorAll('[data-js="lista-opcoes"]').forEach(function (lista) {
    var campo = porId(lista.dataset.campo);
    iniciais.set(campo.id, campo.value);
  });
  // Serialização dos alternadores e restauração visual de campos customizados.
  document.querySelectorAll(".alternador-tipo").forEach(function (grupo) {
    grupo.addEventListener("click", function (evento) {
      var botao = evento.target.closest("[data-valor]");
      var tipo = grupo.parentElement.querySelector('input[name="tipo"]');
      if (botao && tipo) tipo.value = botao.dataset.valor;
    });
  });
  document.addEventListener("reset", function (evento) {
    setTimeout(function () {
      var form = evento.target;
      form.querySelectorAll('input, select').forEach(function (campo) { campo.setCustomValidity(''); });
      form.querySelectorAll('#resumo-valor, #resumo-periodo').forEach(function (resumo) { resumo.textContent = resumosIniciais.get(resumo.id); });
      form.querySelectorAll('[data-js="lista-opcoes"]').forEach(function (lista) {
        var campo = porId(lista.dataset.campo);
        ui.escolherOpcao(campo.id, iniciais.get(campo.id));
      });
      if (form.dataset.modo !== "editar") form.querySelectorAll(".alternador-tipo").forEach(function (grupo) {
        grupo.querySelectorAll("button").forEach(function (botao, i) {
          botao.setAttribute("aria-pressed", String(i === 0));
          if (i === 0) {
            var campoTipo = grupo.parentElement.querySelector('input[name="tipo"]');
            if (campoTipo) campoTipo.value = botao.dataset.valor;
          }
        });
      });
      form.querySelectorAll(".campo--erro").forEach(function (campo) { campo.classList.remove("campo--erro"); });
      form.querySelectorAll('[aria-invalid="true"]').forEach(function (campo) { campo.removeAttribute("aria-invalid"); });
      form.querySelectorAll('[data-dado="mensagem-erro"]').forEach(function (erro) { erro.hidden = true; });
    }, 0);
  });

  // Faixas: sincroniza apenas os controles e o resumo, sem filtrar valores financeiros.
  document.querySelectorAll('[data-js="controle-valor"]').forEach(function (controle) {
    var textos = controle.querySelectorAll('input[type="text"]');
    var faixas = controle.querySelectorAll('input[type="range"]');
    if (textos.length !== 2 || faixas.length !== 2) return;
    function numero(texto) { return Number(texto.replace(/[^\d,-]/g, "").replace(",", ".")); }
    function sincronizar(origem, indice) {
      var valores = Array.from(faixas, function (faixa) { return Number(faixa.value); });
      if (origem === "texto") valores[indice] = numero(textos[indice].value);
      valores[indice] = Math.max(0, Math.min(99000, valores[indice] || 0));
      if (indice === 0) valores[0] = Math.min(valores[0], valores[1]);
      else valores[1] = Math.max(valores[0], valores[1]);
      valores.forEach(function (valor, i) {
        faixas[i].value = valor;
        textos[i].value = moeda.format(valor);
      });
      var resumo = porId("resumo-valor");
      if (resumo) resumo.textContent = textos[0].value + " – " + textos[1].value;
    }
    faixas.forEach(function (faixa, i) { faixa.addEventListener("input", function () { sincronizar("faixa", i); }); });
    textos.forEach(function (texto, i) { texto.addEventListener("change", function () { sincronizar("texto", i); }); });
  });

  // Editar abre os dados visíveis da linha; não fabrica informação de pagamento inexistente.
  document.addEventListener("click", function (evento) {
    var botao = evento.target.closest("button, a[data-js]");
    if (!botao) return;
    if (botao.matches("a[data-js]")) evento.preventDefault();
    if (botao.dataset.alvo === "js-modal-lancamento") {
      var form = document.querySelector('[data-js="formulario-lancamento"]');
      form.dataset.modo = botao.dataset.modo || "novo";
      form.reset();
      var linha = botao.closest("tr");
      if (linha && botao.dataset.modo === "editar") {
        var celulas = linha.cells;
        form.elements.descricao.value = celulas[0].textContent.trim();
        form.elements.valor.value = Number(celulas[5].textContent.replace(/[^\d,]/g, "").replace(",", "."));
        form.elements.data.value = linha.querySelector("time").dateTime;
        form.elements.categoria.value = celulas[2].textContent.trim();
        form.elements.status.value = celulas[4].textContent.trim();
        var tipo = linha.querySelector(".selo-tipo--entrada") ? "entrada" : "saida";
        form.elements.tipo.value = tipo;
        form.querySelectorAll('[data-js="tipo-lancamento"]').forEach(function (item) { item.setAttribute("aria-pressed", String(item.dataset.valor === tipo)); });
        form.elements.parcelas.value = ""; // A tabela ilustrativa não fornece este dado.
      }
    }
    if (botao.dataset.alvo === "js-dialogo-exclusao") {
      var descricao = botao.closest("tr").querySelector('th[scope="row"]').textContent.trim();
      document.querySelector('[data-dado="descricao-exclusao"]').textContent = descricao;
    }
    if (botao.dataset.js === "confirmar-exclusao") avisar("Não foi possível excluir a movimentação. Serviço indisponível.");
    if (botao.dataset.js === "exportar-dados") avisar("Serviço de exportação indisponível no momento.");
    if (botao.dataset.js === "marcar-todas-lidas") {
      document.querySelectorAll(".notificacao--nao-lida").forEach(function (item) {
        item.classList.remove("notificacao--nao-lida");
        var rotulo = item.querySelector(".texto-oculto");
        if (rotulo) rotulo.remove();
      });
      avisar("Notificações marcadas como lidas.");
    }
  });
  var arquivo = porId("js-importar-arquivo");
  if (arquivo) arquivo.addEventListener("change", function () {
    document.querySelector('[data-dado="arquivo-selecionado"]').textContent = arquivo.files[0] ? "Selecionado: " + arquivo.files[0].name : "Nenhum arquivo selecionado.";
  });

  window.TexpandInterface.informar = avisar;
})();
