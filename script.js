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
const playerLoading = document.querySelector('#player-loading');
const videoTitle = document.querySelector('#video-title');
const videoArtist = document.querySelector('#video-artist');
const videoDate = document.querySelector('#video-date');
let youtubePlayer = null;
let playerReady = false;
let selectedVideoId = 'hy6rHiXSAjw';

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new YT.Player('youtube-player', {
    videoId: selectedVideoId,
    width: '100%',
    height: '100%',
    playerVars: { controls: 1, fs: 1, playsinline: 1, rel: 0, origin: window.location.origin },
    events: {
      onReady: event => {
        playerReady = true;
        playerLoading.hidden = true;
        if (event.target.getVideoData().video_id !== selectedVideoId) {
          event.target.cueVideoById(selectedVideoId);
        }
      },
      onError: () => {
        playerLoading.hidden = false;
        playerLoading.textContent = '動画を読み込めませんでした。ページを再読み込みしてください。';
      }
    }
  });
};

const youtubeApi = document.createElement('script');
youtubeApi.src = 'https://www.youtube.com/iframe_api';
youtubeApi.async = true;
document.head.appendChild(youtubeApi);

document.querySelectorAll('[data-youtube]').forEach(card => card.addEventListener('click', () => {
  videoTitle.textContent = card.dataset.title;
  videoArtist.textContent = card.dataset.artist;
  videoDate.textContent = card.dataset.date;

  selectedVideoId = card.dataset.youtube;
  if (playerReady) youtubePlayer.cueVideoById(selectedVideoId);

  document.querySelectorAll('[data-youtube]').forEach(item => item.classList.remove('is-active'));
  card.classList.add('is-active');
  playerScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));
