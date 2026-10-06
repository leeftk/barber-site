# Matheus Schiavone — Barbeiro em Ipanema

Site de uma página do barbeiro Matheus Schiavone, que atende na Ipa Barber Shop, em Ipanema, Rio de Janeiro.

Publicado pelo GitHub Pages: https://leeftk.github.io/barber-site/

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | A página do site (estrutura, SEO e textos padrão) |
| `assets/css/styles.css` | Todo o visual |
| `assets/js/main.js` | Menu do celular, animações e leitura do conteúdo editável |
| `assets/fonts/` | Fontes hospedadas no próprio site |
| `content/site.json` | **Conteúdo editável**: textos, links, serviços, preços, horários e fotos |
| `images/` | Fotos do site (as enviadas pelo painel também ficam aqui) |
| `.pages.yml` | Configuração do painel administrativo (Pages CMS) |
| `admin/` | Página com o atalho para o painel (não aparece no Google) |
| `heritage/`, `editorial/`, `sunlit/` | Protótipos antigos, mantidos só como referência |

Não há dependências nem etapa de build: são arquivos HTML, CSS e JavaScript puros.

## Como editar o conteúdo

### Pelo painel (recomendado)

1. Acesse https://app.pagescms.org e entre com a conta do GitHub.
2. Autorize o acesso ao repositório `barber-site` (só na primeira vez).
3. Abra **Informações do site**, faça as alterações e clique em **Save**.
4. O GitHub Pages publica a mudança em 1 a 2 minutos.

Depois de editar pelo painel, clique em **Fetch origin** e depois em **Pull origin** no GitHub Desktop antes de mexer nos arquivos no computador.

### Pelo código

Edite `content/site.json`. Para trocar uma foto, coloque o arquivo em `images/` e atualize o caminho no JSON (ex.: `"images/minha-foto.jpg"`). Prefira fotos JPG com até 1600 px de largura e menos de 300 KB.

O título da página, a descrição para o Google e a imagem de compartilhamento ficam no `<head>` do `index.html`.

## Testar no computador

O conteúdo do `site.json` só carrega quando o site é aberto por um servidor (abrir o arquivo com dois cliques mostra só os textos padrão). Na pasta do projeto, rode:

```
python -m http.server 8000
```

E abra http://localhost:8000 no navegador.
