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
const youtubePlayerHost = document.querySelector('#youtube-player-host');
const videoPoster = document.querySelector('#video-poster');
const videoTitle = document.querySelector('#video-title');
const videoArtist = document.querySelector('#video-artist');
const videoDate = document.querySelector('#video-date');
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

function mountYoutubePlayer(videoId) {
  const frame = document.createElement('iframe');
  frame.id = 'youtube-player';
  frame.title = `${compactTitle(videoTitle.textContent)} YouTube動画プレイヤー`;
  frame.src = `./player.html?v=${encodeURIComponent(videoId)}&rev=c0cf38c`;
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen = true;
  youtubePlayerHost.replaceChildren(frame);
}

videoPoster.addEventListener('click', () => {
  videoPoster.hidden = true;
  mountYoutubePlayer(selectedVideoId);
});

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

  youtubePlayerHost.replaceChildren(Object.assign(document.createElement('span'), { id: 'youtube-player' }));
  const posterImage = videoPoster.querySelector('img');
  posterImage.src = `https://i.ytimg.com/vi/${selectedVideoId}/maxresdefault.jpg`;
  posterImage.alt = `${compactTitle(selectedVideo.title)} 動画サムネイル`;
  videoPoster.setAttribute('aria-label', `${compactTitle(selectedVideo.title)}をページ内で再生`);
  videoPoster.classList.remove('is-loading');
  videoPoster.hidden = false;

  playerScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));
