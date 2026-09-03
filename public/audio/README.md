# Música de fundo do Story

Duas formas de ter música no Story, nenhuma delas com direito autoral embutido
no projeto (eu não posso incluir uma música de verdade aqui por licença):

## 1. Playlist padrão (o que toca por padrão pra todo mundo)

1. Baixe suas faixas royalty-free/Creative Commons e salve em `public/audio/playlist/`.
2. Liste elas em `public/audio/playlist.json`, assim:

```json
[
  { "title": "Nome da música - Artista", "src": "/audio/playlist/nome-do-arquivo.mp3" },
  { "title": "Outra música - Artista", "src": "/audio/playlist/outra-faixa.mp3" }
]
```

Se o arquivo ficar vazio (`[]`, o padrão), o botão de música mostra "Nenhuma
música ainda" até alguém enviar a própria — nada quebra.

## 2. Upload na hora, pela própria pessoa

No Story, o botão 🎵 abre um painel com a opção "📤 Enviar sua música" — a
pessoa escolhe um arquivo de áudio do próprio aparelho e ele toca na hora. Fica
só na memória do navegador dela; nunca é enviado a lugar nenhum, nunca vai pro
seu repositório.

## De onde tirar música royalty-free pra playlist padrão

Sempre confira a licença de cada faixa antes de usar, mesmo em bancos "gratuitos":

- **incompetech.com** (Kevin MacLeod) — milhares de faixas sob Creative Commons
  BY 4.0 (uso livre, inclusive comercial, creditando o artista no projeto; dá
  pra pagar uma taxa única se não quiser colocar crédito). Tem categorias por
  clima/gênero, incluindo trilhas mais "sentimentais"/românticas.
- YouTube Audio Library — youtube.com/audiolibrary
- Pixabay Music — pixabay.com/music
- Free Music Archive — freemusicarchive.org

## Formato

- Prefira `.mp3`, arquivo pequeno (menos de ~5 MB por faixa) já que carrega no
  navegador de quem estiver vendo a retrospectiva.
