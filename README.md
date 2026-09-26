# APS Proof Studio

Aplicação local para criação de provas visuais de uniformes esportivos, com suporte a múltiplos modelos por projeto, composição por modelo, identidade visual, nome/numeração e geração de PDF pelo navegador.

## Segurança e privacidade

Este repositório público usa **somente dados e imagens fictícios**. Nenhum arquivo de cliente, projeto real, token, chave de API, credencial ou documento de produção deve ser versionado aqui.

O APS Proof Studio roda no navegador e salva o projeto localmente via IndexedDB. Projetos exportados (`.apsproof`) podem conter dados de trabalho e, por isso, são ignorados pelo Git.

## Executar localmente

Abra o `index.html` diretamente no navegador para usar os recursos básicos.

Para acesso às fontes instaladas no computador, use Chrome ou Edge e sirva o projeto em `localhost`:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Estrutura

```text
index.html
assets/
  css/
    ui.css
    pdf.css
    models.css
  js/
    state.js
    editor.js
    pdf.js
    fonts.js
    bindings.js
    media.js
  sample/
    mockup.svg
    texture-top.svg
    crest.svg
    sponsor-01.svg
    sponsor-02.svg
    sponsor-03.svg
```

## Dados de demonstração

A identidade **AURORA FC** e os patrocinadores **NORTE SPORTS**, **VIVA ENERGIA** e **PONTO ZERO** são fictícios e existem apenas para demonstração da interface.

Os SVGs em `assets/sample/` foram criados como referências neutras para que o projeto público não dependa de marcas, escudos ou trabalhos reais.

## O que não deve ser publicado

- arquivos `.apsproof` de clientes;
- PDFs de produção ou aprovação;
- logos, escudos e patrocinadores reais sem autorização;
- listas com nomes, números ou dados pessoais;
- arquivos `.env`, tokens, chaves e credenciais;
- backups e pastas internas de clientes.

## Licença

Nenhuma licença de reutilização foi definida neste momento. O fato de o repositório ser público não concede automaticamente permissão para redistribuição ou uso comercial do código.
