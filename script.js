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

function formatRelativeDate(published, now = new Date()) {
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(published)) / 60000));
  if (elapsedMinutes < 60) return `${Math.max(1, elapsedMinutes)}分前`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}か月前`;
  return `${Math.floor(days / 365)}年前`;
}

function updateRelativeDates() {
  videoDate.textContent = formatRelativeDate(videoDate.dataset.published);
  document.querySelectorAll('.mini-card').forEach(card => {
    card.querySelector('small').textContent = formatRelativeDate(card.dataset.published);
  });
}

updateRelativeDates();

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
        event.target.unMute();
        event.target.setVolume(100);
        if (event.target.getVideoData().video_id !== selectedVideoId) {
          event.target.cueVideoById(selectedVideoId);
        }
      },
      onStateChange: event => {
        if (event.data === YT.PlayerState.PLAYING) {
          event.target.unMute();
          event.target.setVolume(100);
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

function compactTitle(title) {
  return title.replace(/【.*?】/g, '').trim();
}

function compactArtist(artist) {
  return artist.split('｜')[0].trim();
}

function readMiniCard(card) {
  return {
    id: card.dataset.youtube,
    title: card.dataset.title,
    artist: card.dataset.artist,
    published: card.dataset.published,
    duration: card.querySelector('.thumb i').textContent
  };
}

function writeMiniCard(card, video) {
  card.dataset.youtube = video.id;
  card.dataset.title = video.title;
  card.dataset.artist = video.artist;
  card.dataset.published = video.published;

  const image = card.querySelector('.thumb img');
  image.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
  image.alt = `${compactTitle(video.title)} 動画サムネイル`;

  const duration = card.querySelector('.thumb i');
  duration.textContent = video.duration;
  duration.hidden = !video.duration;

  const label = card.querySelector('b');
  label.replaceChildren(
    Object.assign(document.createElement('span'), { textContent: compactTitle(video.title) }),
    Object.assign(document.createElement('span'), { textContent: compactArtist(video.artist) })
  );
  card.querySelector('small').textContent = formatRelativeDate(video.published);
}

document.querySelectorAll('[data-youtube]').forEach(card => card.addEventListener('click', () => {
  const selectedVideo = readMiniCard(card);
  const previousFeaturedVideo = {
    id: selectedVideoId,
    title: videoTitle.textContent,
    artist: videoArtist.textContent,
    published: videoDate.dataset.published,
    duration: ''
  };

  videoTitle.textContent = selectedVideo.title;
  videoArtist.textContent = selectedVideo.artist;
  videoDate.dataset.published = selectedVideo.published;
  videoDate.textContent = formatRelativeDate(selectedVideo.published);
  selectedVideoId = selectedVideo.id;
  writeMiniCard(card, previousFeaturedVideo);

  if (playerReady) youtubePlayer.cueVideoById(selectedVideoId);

  playerScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));
