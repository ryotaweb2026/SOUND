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

const youtubePlayer = document.querySelector('#youtube-player');
const videoTitle = document.querySelector('#video-title');
const videoArtist = document.querySelector('#video-artist');
const videoDate = document.querySelector('#video-date');
let selectedVideo = {
  id: 'hy6rHiXSAjw',
  title: videoTitle.textContent,
  artist: videoArtist.textContent,
  date: videoDate.textContent,
  duration: ''
};

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
    date: card.dataset.date,
    duration: card.querySelector('.thumb i').textContent
  };
}

function writeMiniCard(card, video) {
  card.dataset.youtube = video.id;
  card.dataset.title = video.title;
  card.dataset.artist = video.artist;
  card.dataset.date = video.date;

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
  card.querySelector('small').textContent = video.date;
}

document.querySelectorAll('[data-youtube]').forEach(card => card.addEventListener('click', () => {
  const nextVideo = readMiniCard(card);
  writeMiniCard(card, selectedVideo);
  selectedVideo = nextVideo;

  videoTitle.textContent = selectedVideo.title;
  videoArtist.textContent = selectedVideo.artist;
  videoDate.textContent = selectedVideo.date;
  youtubePlayer.title = `${compactTitle(selectedVideo.title)} YouTube動画プレイヤー`;
  youtubePlayer.src = `./player.html?v=${encodeURIComponent(selectedVideo.id)}`;
}));
