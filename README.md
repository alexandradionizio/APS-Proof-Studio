<div align="center">

# APS Proof Studio

**Estúdio local para montar, revisar e apresentar provas de uniformes esportivos.**

Organize mockups, fundo e composição, escudos, patrocinadores, tipografia e conferência final em um único fluxo — com preview separado e saída em PDF A4.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-D4A72C)
![Uso](https://img.shields.io/badge/uso-local--first-2EA44F)
![Interface](https://img.shields.io/badge/interface-navegador-111111)

</div>

---

## Sobre o projeto

O **APS Proof Studio** foi criado para transformar a montagem de provas de uniformes em um processo mais organizado e visual.

Em vez de conferir mockup, estampa, patrocinadores, posições, fontes e observações em arquivos separados, o projeto reúne essas informações em uma apresentação estruturada para conferência do cliente.

O Studio roda no navegador, mantém o projeto salvo localmente e gera uma prova visual pronta para impressão ou exportação em PDF.

## Principais recursos

- **Múltiplos modelos por projeto** — linha, goleiro, comissão ou qualquer outra variação, com um modelo principal e possibilidade de reutilizar identidade e tipografia.
- **Fundo & composição por modelo** — parte de cima e parte de baixo, leitura visual e paleta de referência.
- **Identidade & elementos** — escudo, patrocinadores, logos e outras aplicações, separados entre parte de cima e parte de baixo.
- **Ordenação manual dos elementos** — ajuste a sequência de apresentação dos patrocinadores dentro de cada seção.
- **Posicionamentos detalhados** — peito, mangas, ombros, laterais, costas, calção e opção personalizada.
- **Nome & numeração** — seleção independente de fontes instaladas no computador, caracteres completos e amostras ampliadas.
- **Uploads flexíveis** — PNG, JPG, JPEG, WEBP, SVG e PDF. PDFs são convertidos localmente a partir da primeira página para uso visual no projeto.
- **Preview em janela separada** — ideal para trabalhar com o painel em uma tela e visualizar a prova em outra.
- **Sincronização automática** — editor e preview se comunicam via `BroadcastChannel`.
- **Persistência local** — o projeto atual é salvo no navegador via IndexedDB.
- **Importação e exportação de projeto** — arquivos `.apsproof` permitem continuar o trabalho depois.
- **Saída A4** — a prova é preparada para impressão e geração de PDF pelo navegador.

## Fluxo do Studio

| Etapa | Função |
| --- | --- |
| **01. Projeto** | Dados gerais, versão, status e tema visual |
| **02. Modelos** | Mockups e variações do uniforme |
| **03. Fundo & composição** | Artes da camisa/calção, observações e paleta |
| **04. Identidade & elementos** | Escudo, patrocinadores, posições e ordem |
| **05. Nome & numeração** | Fontes, caracteres e exemplos de personalização |
| **06. Conferência final** | Checklist e dados de aprovação |

Há também um fluxo separado para **Prova de Lista**, destinado à conferência de nomes, números, tamanhos e observações.

## Interface Studio

O editor principal funciona como um painel de controle. Cada etapa abre separadamente no centro da interface para evitar uma tela única sobrecarregada.

O botão **Visualizar prova ↗** abre `preview.html` em outra janela. Essa janela recebe automaticamente o estado atual do projeto e pode permanecer aberta durante a edição.

Fechar o preview **não apaga o projeto**: o estado continua salvo localmente no navegador.

## Formatos de arquivo

| Uso | Formatos |
| --- | --- |
| Mockups, escudos, patrocinadores e elementos | PNG, JPG, JPEG, WEBP, SVG, PDF |
| Fundo / composição | PNG, JPG, JPEG, WEBP, SVG, PDF |
| Projeto do APS | `.apsproof` |
| Fontes locais | Lidas diretamente do computador em navegadores compatíveis |

Quando um **PDF** é usado em um campo visual, o APS renderiza a **primeira página** como imagem para o projeto. O arquivo é processado no navegador.

## Executar localmente

A forma recomendada é servir a pasta em `localhost`, especialmente para usar as fontes instaladas no computador.

```bash
git clone https://github.com/alexandradionizio/APS-Proof-Studio.git
cd APS-Proof-Studio
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000/index.html
```

### Navegador recomendado

Use **Chrome ou Edge** no computador para ter acesso ao recurso de leitura de fontes locais.

A conversão de PDF usa **PDF.js** carregado por CDN. Por isso, é necessária conexão com a internet para carregar essa biblioteca; os arquivos escolhidos continuam sendo processados pelo navegador, sem um backend do APS.

## Arquitetura

```text
APS-Proof-Studio/
├── index.html
├── preview.html
├── assets/
│   ├── css/
│   │   ├── ui.css
│   │   ├── models.css
│   │   ├── studio.css
│   │   ├── pdf.css
│   │   └── preview.css
│   ├── js/
│   │   ├── state.js
│   │   ├── editor.js
│   │   ├── bindings.js
│   │   ├── media.js
│   │   ├── fonts.js
│   │   ├── pdf.js
│   │   ├── navigation.js
│   │   ├── preview-bridge.js
│   │   └── preview.js
│   └── sample/
│       ├── mockup.svg
│       ├── texture-top.svg
│       ├── crest.svg
│       ├── sponsor-01.svg
│       ├── sponsor-02.svg
│       └── sponsor-03.svg
└── README.md
```

### Responsabilidades principais

| Arquivo | Responsabilidade |
| --- | --- |
| `state.js` | Estado do projeto, modelos, normalização e persistência |
| `editor.js` | Renderização dos editores e manipulação dos dados |
| `bindings.js` | Eventos dos campos e controles da interface |
| `media.js` | Upload, drag-and-drop, colagem e conversão de arquivos visuais |
| `fonts.js` | Leitura, cache e aplicação de fontes locais |
| `pdf.js` | Montagem das páginas da prova |
| `navigation.js` | Navegação entre as etapas do Studio |
| `preview-bridge.js` | Sincronização entre painel e preview |
| `preview.js` | Renderização e atualização da janela de preview |

## Segurança e privacidade

O APS Proof Studio foi pensado como uma ferramenta **local-first**.

Os dados do projeto ficam no navegador via IndexedDB, e não existe um backend do APS recebendo arquivos de clientes.

Este repositório público usa **somente dados e imagens fictícios**. Nenhum projeto real, arquivo de cliente, token, chave de API, credencial ou documento de produção deve ser versionado aqui.

Arquivos exportados em `.apsproof` podem conter dados e imagens de trabalho e, por isso, devem ser tratados como arquivos privados.

## Dados de demonstração

A identidade **AURORA FC** e os patrocinadores **NORTE SPORTS**, **VIVA ENERGIA** e **PONTO ZERO** são fictícios e existem apenas para demonstrar a interface.

Os SVGs em `assets/sample/` foram criados como referências neutras para que o repositório público não dependa de marcas, escudos ou trabalhos reais.

## O que não deve ser publicado neste repositório

| Não versionar | Motivo |
| --- | --- |
| Projetos `.apsproof` de clientes | Podem conter dados e imagens de trabalho |
| PDFs de produção ou aprovação | Podem expor projetos reais |
| Logos, escudos e patrocinadores reais sem autorização | Direitos e confidencialidade |
| Listas com nomes, números ou dados pessoais | Privacidade |
| `.env`, tokens, chaves e credenciais | Segurança |
| Backups e pastas internas de clientes | Confidencialidade |

## Estado do projeto

O APS Proof Studio está em **desenvolvimento ativo**. A estrutura e os recursos podem mudar conforme o fluxo de trabalho é refinado.

O foco atual é manter o processo simples para quem produz a prova, sem expor informações técnicas desnecessárias ao cliente final.

## Licença

Nenhuma licença de reutilização foi definida neste momento.

O fato de o repositório ser público **não concede automaticamente permissão para redistribuição, modificação ou uso comercial do código**.
