# Música de fundo do Story

Três formas de ter música no Story:

## 1. Som ambiente (o padrão, já funciona sem configurar nada)

Um "pad" suave gerado por código (osciladores + filtro, via Web Audio API) —
não é um arquivo de áudio, é sintetizado na hora. Por isso não tem nenhuma
questão de direito autoral e já funciona assim que alguém abre o Story e toca
o botão 🎵. Ver `src/lib/audio/ambientSound.ts` se quiser ajustar o acorde/tom.

## 2. Playlist local (opcional, pra ter músicas de verdade)

1. Baixe suas faixas royalty-free/Creative Commons e salve em `public/audio/playlist/`.
2. Liste elas em `public/audio/playlist.json`, assim:

```json
[
  { "title": "Nome da música - Artista", "src": "/audio/playlist/nome-do-arquivo.mp3" },
  { "title": "Outra música - Artista", "src": "/audio/playlist/outra-faixa.mp3" }
]
```

Com playlist configurada, ela aparece como opção extra ao lado do "🎼 Ambiente"
no painel de música do Story — a pessoa escolhe qual quer.

## 3. Upload na hora, pela própria pessoa

No Story, o botão 🎵 abre um painel com a opção "📤 Enviar sua música" — a
pessoa escolhe um arquivo de áudio do próprio aparelho e ele toca na hora. Fica
só na memória do navegador dela; nunca é enviado a lugar nenhum, nunca vai pro
seu repositório.

## De onde tirar música royalty-free pra playlist local

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

