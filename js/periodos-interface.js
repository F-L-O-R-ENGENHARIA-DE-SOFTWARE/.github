/* Arquivo: js/periodos-interface.js
 * Função: seleção visual de mês e intervalo de datas; não consulta nem recalcula dados.
 * Usado por: visao-geral.html e movimentacoes.html. Datas interpretadas localmente, sem conversão UTC. */
(function () {
  "use strict";
  var ui = window.TexpandInterface;
  var nomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  function porId(id) { return document.getElementById(id); }
  var meses = porId("js-popover-mes");
  if (meses) {
    var ano = 2026;
    var cabecalho = meses.querySelector(".grade-meses__cabecalho span");
    meses.querySelectorAll(".calendario__navegar").forEach(function (botao, i) {
      botao.addEventListener("click", function () { ano += i === 0 ? -1 : 1; cabecalho.textContent = ano; });
    });
    meses.querySelectorAll("[data-mes]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        meses.querySelectorAll("[data-mes]").forEach(function (outro) { outro.setAttribute("aria-pressed", String(outro === botao)); });
        document.querySelector(".seletor-mes span").textContent = nomes[Number(botao.dataset.mes) - 1] + " de " + ano;
        ui.fecharJanela(meses);
        document.querySelector(".seletor-mes").focus();

      });
    });
  }
  var periodo = porId("js-popover-periodo");
  if (!periodo) return;
  var inicio = porId("js-periodo-inicio");
  var fim = porId("js-periodo-fim");
  var calendario = periodo.querySelector(".calendario");
  var grade = calendario.querySelector(".calendario__grade");
  var mes = 10, anoCalendario = 2026, aguardaFim = false;
  function iso(ano, mes_, dia) { return ano + "-" + String(mes_ + 1).padStart(2, "0") + "-" + String(dia).padStart(2, "0"); }
  function desenhar() {
    calendario.querySelector(".calendario__mes span").textContent = nomes[mes] + " de " + anoCalendario;
    calendario.setAttribute("aria-label", nomes[mes] + " de " + anoCalendario);
    grade.querySelectorAll("[data-dia], .calendario__dia--fora").forEach(function (dia) { dia.remove(); });
    var deslocamento = new Date(anoCalendario, mes, 1).getDay();
    for (var espaco = 0; espaco < deslocamento; espaco++) {
      var vazio = document.createElement("span");
      vazio.className = "calendario__dia--fora";
      vazio.setAttribute("aria-hidden", "true");
      grade.appendChild(vazio);
    }
    var ultimo = new Date(anoCalendario, mes + 1, 0).getDate();
    for (var dia = 1; dia <= ultimo; dia++) {
      var botao = document.createElement("button");
      var valor = iso(anoCalendario, mes, dia);
      botao.type = "button";
      botao.className = "calendario__dia";
      botao.textContent = dia;
      botao.dataset.dia = valor;
      botao.setAttribute("aria-label", dia + " de " + nomes[mes].toLowerCase() + " de " + anoCalendario);
      botao.setAttribute("aria-pressed", String(valor === inicio.value || valor === fim.value));
      botao.classList.toggle("calendario__dia--inicio", valor === inicio.value);
      botao.classList.toggle("calendario__dia--fim", valor === fim.value);
      botao.classList.toggle("calendario__dia--intervalo", valor > inicio.value && valor < fim.value);
      grade.appendChild(botao);
    }
  }
  calendario.querySelectorAll(".calendario__navegar").forEach(function (botao, i) {
    botao.addEventListener("click", function () {
      mes += i === 0 ? -1 : 1;
      if (mes < 0) { mes = 11; anoCalendario--; }
      if (mes > 11) { mes = 0; anoCalendario++; }
      desenhar();
    });
  });
  grade.addEventListener("click", function (evento) {
    var dia = evento.target.closest("[data-dia]");
    if (!dia) return;
    // O redesenho remove o botão clicado; manter o evento no calendário evita
    // que o fechamento global interprete o elemento removido como clique externo.
    evento.stopPropagation();
    var valor = dia.dataset.dia;
    if (!aguardaFim) { inicio.value = valor; fim.value = valor; aguardaFim = true; }
    else {
      if (valor < inicio.value) { fim.value = inicio.value; inicio.value = valor; }
      else fim.value = valor;
      aguardaFim = false;
    }
    desenhar();
    grade.querySelector('[data-dia="' + valor + '"]').focus();
  });
  inicio.addEventListener("change", desenhar);
  fim.addEventListener("change", desenhar);
  var aplicado = [inicio.value, fim.value];
  periodo.querySelector('[data-js="aplicar-periodo"]').addEventListener("click", function () {
    fim.setCustomValidity(fim.value < inicio.value ? "A data final deve ser igual ou posterior à data inicial." : "");
    if (!inicio.reportValidity() || !fim.reportValidity()) return;
    aplicado = [inicio.value, fim.value];
    porId("resumo-periodo").textContent = inicio.value.split("-").reverse().join("/") + " – " + fim.value.split("-").reverse().join("/");
    ui.fecharJanela(periodo);
    porId("js-botao-periodo").focus();

  });
  // Cancelar e reabrir restauram as datas aplicadas, sem levar o rascunho adiante.
  porId("js-botao-periodo").addEventListener("click", function () {
    inicio.value = aplicado[0]; fim.value = aplicado[1]; fim.setCustomValidity(""); aguardaFim = false;
    var partes = inicio.value.split("-"); anoCalendario = Number(partes[0]); mes = Number(partes[1]) - 1;
    desenhar();
  });
  periodo.closest('form').addEventListener('reset', function () {
    aplicado = [inicio.defaultValue, fim.defaultValue];
    setTimeout(function () { fim.setCustomValidity(''); aguardaFim = false; desenhar(); }, 0);
  });
  desenhar();
})();
