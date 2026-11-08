# TEXPAND — HTML, CSS e estados de interface

## Abrir o projeto

Extraia o ZIP e abra `texpand/index.html` ou `texpand/login.html`. A pasta funciona sem instalação de pacotes e sem build. Para desenvolvimento, execute `python3 -m http.server 8000` dentro de `texpand` e acesse `http://localhost:8000`.

A fonte Inter utiliza Google Fonts, com alternativa local de sistema. Foto e ícones estão incluídos. Nenhuma dependência de desenvolvimento é necessária para abrir as telas.

## Revisão visual atual

A base oficial é o visual cinza do ZIP de referências, conforme a decisão do responsável. As figuras azul escuras/coloridas do PDF não substituem essa identidade.

- Interface compacta: cabeçalho de 64 px, controles de desktop de 36 px e acesso de 44 px. Dispositivos de toque preservam alvos maiores.
- Login com cartão de largura fluida, campos menores e espaçamentos proporcionais. Cadastro usa duas colunas quando há espaço.
- Dashboard com indicadores e gráficos na mesma barra de ações. Seus filtros usam a mesma lista suspensa personalizada de Movimentações.
- Tema global claro/escuro para acesso e sistema. As janelas de filtro, listas de opções, calendário e seletor de mês mantêm a paleta escura em ambos os temas, conforme o ajuste mais recente.
- Configurações em duas colunas no desktop; glossários da Ajuda recolhíveis.
- Avisos, rótulos e mensagens de demonstração removidos da interface. Informações técnicas de integração permanecem neste documento e nos comentários do código.

## Tema entre páginas

`js/tema.js` é carregado no `head`, sem `defer`, antes da folha de estilos. Ele aplica a escolha antes da pintura, sincroniza os rádios de Configurações e os botões de tema e grava **somente a preferência visual** na chave `texpand-tema` de `localStorage`.

Links locais também recebem `?tema=claro` ou `?tema=escuro`. Isso mantém a escolha ao abrir arquivos locais, mesmo quando o navegador restringe ou separa seu armazenamento. O redirecionamento de `index.html` e a navegação do login preservam esse parâmetro. Um tema informado na URL tem prioridade sobre o tema armazenado. Se o armazenamento for bloqueado, a troca continua funcionando na página e nos links.

API: `window.TexpandTema.aplicar("escuro")`, `window.TexpandTema.aplicar("claro")` e `window.TexpandTema.endereco("visao-geral.html")`.

As cores ficam em `css/variaveis.css` e `css/paginas/tema.css`. Componentes de janela usam tokens próprios de texto, fundo, ação e seleção, evitando texto branco fixo sobre superfícies claras. A paleta dos gráficos também muda com o tema.

## Estrutura

```text
texpand/
├── index.html
├── login.html, cadastro.html, recuperar-senha.html
├── visao-geral.html, movimentacoes.html
├── configuracoes.html, notificacoes.html, ajuda.html
├── estados.html                 catálogo auxiliar, fora do menu do produto
├── DOCUMENTACAO.md
├── RELATORIO-DE-REVISAO.md
├── VERIFICACAO.json
├── assets/                      foto e fonte dos ícones
├── css/
│   ├── principal.css            importa os estilos na ordem da cascata
│   ├── variaveis.css, base.css, layout.css
│   ├── componentes/
│   └── paginas/                 inclui tema.css
└── js/
    ├── tema.js                  preferência global antes da pintura
    ├── estados-interface.js     janelas, menu, senha e alternadores
    ├── lista-opcoes.js          seleção de opções por mouse e teclado
    ├── formularios-interface.js validação, preenchimento e respostas dos formulários
    ├── periodos-interface.js    seleção de mês e intervalo
    └── dashboard-interface.js   seleção de indicadores e modelos de gráfico
```

`js/previa-interface.js` foi substituído por `js/formularios-interface.js`. Não mantenha os dois arquivos carregados. Classes BEM, IDs de controles, `data-js`, `data-alvo`, `data-dado` e os modelos de linha foram preservados.

## Escopo e integração

Esta entrega continua sendo de apresentação e navegação. A remoção dos avisos de demonstração não acrescenta autenticação, banco, CRUD, importação/exportação, cálculos financeiros ou filtragem real.

- O login válido navega para a Visão Geral, sem verificar identidade.
- A edição preenche os dados visíveis da linha; não inventa pagamento ou parcelas não informados.
- Cadastro, recuperação, gravação, exclusão e importação/exportação não enviam nem persistem dados. Quando acionados, informam indisponibilidade do respectivo serviço, sem alegar sucesso.
- Filtros de consulta atualizam seus controles, sem consultar ou recalcular os dados.
- Indicadores alternam os cartões visíveis. Gráficos alternam entre barras/rosca, linhas do fluxo de caixa e pizza das despesas, usando os mesmos valores fixos.
- O dashboard mensal e as oito linhas da lista são conjuntos ilustrativos independentes. A aplicação deve substituí-los pela mesma base financeira real.
- Leitura de notificações muda visualmente na página; as preferências de aviso ainda não são persistidas. O tema é a preferência já persistida nesta entrega.

Antes de integrar os serviços, substitua os interceptadores de submissão em `formularios-interface.js`. Evite deixar respostas de indisponibilidade competindo com handlers de produção.

### Pontos principais

| Gancho | Trabalho da próxima equipe |
|---|---|
| `formulario-login`, `formulario-cadastro`, `formulario-recuperacao` | Autenticar, cadastrar, confirmar e-mail e recuperar senha. Remover a navegação de `data-destino-provisorio`. |
| `formulario-lancamento` | Validar novamente no servidor e persistir data, descrição, magnitude não negativa, tipo, categoria, pagamento, parcelas e status. |
| `abrir` com `data-modo="editar"`, `confirmar-exclusao` | Consultar e alterar/excluir por ID de registro. |
| `formulario-filtro`, `formulario-filtros`, `ordenacao` | Aplicar consulta, filtros, ordenação, paginação e estados de ausência de dados. |
| `js-dashboard-indicador`, `js-dashboard-template` | Campos ocultos das listas de apresentação, atualizados com evento `change`. |
| `aplicar-periodo`, seletor de mês, `controle-valor` | Consumir as datas ISO e valores selecionados nos controles. |
| `formulario-importar` | Ler e validar CSV/XLSX, mapear colunas e importar. A checagem atual de extensão não valida conteúdo. |
| `exportar-dados` | Gerar o relatório do mesmo conjunto válido e filtrado do dashboard. |
| `formulario-conta`, `formulario-senha` | Carregar/salvar dados reais e verificar a senha atual. |
| `lista-notificacoes`, `marcar-todas-lidas`, interruptores de avisos | Consultar notificações e persistir leitura/preferências. |
| `selo-atualizacao` | Elemento vazio e oculto, preparado para receber estado real de sincronização. |
| `data-dado`, `data-grafico`, `js-modelo-linha-movimentacao` | Substituir totais, séries e linhas estáticas. |

`window.TexpandInterface` mantém `abrirJanela`, `fecharJanela`, `alternarPopover` e `escolherOpcao`. `informar(texto)` apresenta uma mensagem de status acessível. O campo oculto de cada lista dispara `change` ao escolher uma opção.

## Decisões mantidas

- Saldo: entradas concluídas menos saídas concluídas. Pendentes separados; cancelados fora dos totais.
- Importação: CSV e Excel `.xlsx` padronizados; relatórios originais do Mercado Livre e Shopee exigem mapeamento.
- Manter telas complementares e incluir indicadores/gráficos previstos no diagrama.
- A opção “Lucro” ainda usa o cartão de saldo. A apuração contábil de lucro não foi definida e não está implementada.

Política de privacidade oficial, contato de suporte, modelo de importação, formato de exportação, categorias e limites de parcelas continuam pendentes. O texto informativo de privacidade não substitui uma política oficial. Controle de sessões, autorização, LGPD, backup e disponibilidade dependem da aplicação/servidor.

## Verificação

Consulte `VERIFICACAO.json` para os resultados da revisão atual, incluindo estrutura HTML, sintaxe CSS/JavaScript, referências locais e verificações no Chromium. Os testes não equivalem a uma auditoria completa de acessibilidade nem substituem homologação em Safari, Firefox e dispositivos reais.

## Correção da ajuda nas telas de acesso

O botão “Precisa de ajuda?” de login, cadastro e recuperação abre um dialog local com orientações de acesso, sem links para as páginas internas nem menu do sistema. A página `ajuda.html` permanece como ajuda da área interna. Esta correção remove o atalho de navegação pela ajuda; a autenticação e a autorização reais continuam sob responsabilidade da aplicação.

## Paleta fixa dos filtros

Janelas de filtro, listas suspensas, filtros de valor/período, seletor de mês e os modais de importação e lançamento usam a paleta escura em ambos os temas. A regra compartilhada de `.popover` e dos modais que contêm formulários de importação/lançamento, em `css/componentes/popovers.css`, inclui campos, textos, seleção, hover, foco, sombras e controles nativos. Demais componentes continuam acompanhando o tema global.

## Desfoque dos fundos de acesso

A classe compartilhada `pagina-acesso` aplica `blur(6px)` à camada `::before`, que exibe `fundo-acesso.jpg` no login, cadastro e recuperação de senha. A camada é independente do conteúdo, preservando a nitidez dos textos, campos e botões. A imagem original não foi alterada.
