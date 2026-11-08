/* Arquivo: js/dashboard-interface.js
 * Função: alternar visuais ilustrativos de gráficos e cartões previstos no diagrama.
 * Usado por: visao-geral.html. Não calcula lucro nem consulta dados. */
(function () {
  "use strict";
  var indicador = document.getElementById("js-dashboard-indicador");
  var template = document.getElementById("js-dashboard-template");
  var grade = document.getElementById("js-paineis-dashboard");
  indicador.addEventListener("change", function () {
    var classes = { renda: "cartao-indicador--receitas", gasto: "cartao-indicador--despesas", lucro: "cartao-indicador--saldo" };
    document.querySelectorAll(".grade-indicadores .cartao-indicador").forEach(function (cartao) {
      cartao.hidden = indicador.value !== "todos" && !cartao.classList.contains(classes[indicador.value]);
    });
    document.querySelector(".grade-indicadores").classList.toggle("grade-indicadores--unico", indicador.value !== "todos");
    // A definição contábil do lucro continua no contrato de integração, fora da interface.
  });
  template.addEventListener("change", function () {
    var modo = template.value;
    grade.dataset.visual = modo;
    document.getElementById("js-painel-fluxo").hidden = modo === "pizza";
    document.getElementById("js-painel-categorias").hidden = modo === "linhas";
    grade.querySelector(".grafico-barras").hidden = modo === "linhas";
    document.getElementById("js-grafico-linhas").hidden = modo !== "linhas";
    document.getElementById("js-total-pizza").hidden = modo !== "pizza";
    var rosca = grade.querySelector(".grafico-rosca__anel");
    rosca.querySelector(".grafico-rosca__centro").hidden = modo === "pizza";
    rosca.setAttribute("aria-label", "Gráfico de " + (modo === "pizza" ? "pizza" : "rosca") + " de despesas por categoria: Serviços 40%, Entrega 30%, Transporte 20%, Outros 10%. Total R$ 23.750,00.");
  });
})();
