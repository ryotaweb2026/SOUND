const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

const player = document.querySelector('#player');
document.querySelectorAll('[data-video]').forEach(card => card.addEventListener('click', () => {
  player.querySelector('h2').textContent = card.dataset.video;
  player.showModal();
}));
player.querySelector('.close').addEventListener('click', () => player.close());
player.addEventListener('click', event => {
  if (event.target === player) player.close();
});

const playerScene = document.querySelector('#player-scene');
const youtubePlayer = document.querySelector('#youtube-player');
const videoPoster = document.querySelector('#video-poster');
const videoPosterImage = document.querySelector('#video-poster-image');
const videoTitle = document.querySelector('#video-title');
const videoArtist = document.querySelector('#video-artist');
const videoDate = document.querySelector('#video-date');

function showVideo(videoId, title) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&controls=1&origin=${encodeURIComponent(window.location.origin)}&widget_referrer=${encodeURIComponent(window.location.href)}`;
  youtubePlayer.src = 'about:blank';
  youtubePlayer.title = title;
  videoPosterImage.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  videoPosterImage.alt = `${title} 動画サムネイル`;
  videoPoster.setAttribute('aria-label', `${title}をページ内で再生`);
  videoPoster.hidden = false;
  videoPoster.onclick = () => {
    videoPoster.classList.add('is-loading');
    const handleLoad = () => {
      videoPoster.hidden = true;
      videoPoster.classList.remove('is-loading');
    };
    youtubePlayer.addEventListener('load', handleLoad, { once: true });
    youtubePlayer.src = embedUrl;
  };
}

showVideo('hy6rHiXSAjw', 'ちゅきミー！｜月見パイもち子【8bit アレンジ】');

document.querySelectorAll('[data-youtube]').forEach(card => card.addEventListener('click', () => {
  videoTitle.textContent = card.dataset.title;
  videoArtist.textContent = card.dataset.artist;
  videoDate.textContent = card.dataset.date;

  showVideo(card.dataset.youtube, card.dataset.title);

  document.querySelectorAll('[data-youtube]').forEach(item => item.classList.remove('is-active'));
  card.classList.add('is-active');
  playerScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));
