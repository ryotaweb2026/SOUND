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

const videoHost = document.querySelector('#youtube-host');
const videoStart = document.querySelector('#video-start');
const videoPoster = document.querySelector('#video-poster');
const videoStatus = document.querySelector('#video-status');
let activePlayer;
let loadTimer;
let loadGeneration = 0;
let apiPromise;
function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => reject(new Error('YouTube APIの読み込みが10秒以内に完了しませんでした')), 10000);
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timer); resolve(); };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { clearTimeout(timer); reject(new Error('YouTube APIに接続できませんでした')); };
    document.head.append(script);
  }).catch(error => { apiPromise = null; throw error; });
  return apiPromise;
}
function resetVideo() {
  loadGeneration++;
  clearTimeout(loadTimer);
  if (activePlayer) { activePlayer.destroy(); activePlayer = null; }
  videoHost.replaceChildren();
  videoStart.hidden = false;
  videoStart.disabled = false;
  videoStatus.hidden = false;
  videoPoster.src = `https://i.ytimg.com/vi/${selectedVideo.id}/mqdefault.jpg`;
  videoPoster.alt = `${compactTitle(selectedVideo.title)} 動画サムネイル`;
  videoStatus.textContent = 'クリックして再生';
}
videoStart.addEventListener('click', async () => {
  if (location.protocol === 'file:') {
    location.replace(`http://127.0.0.1:8873/?video=${encodeURIComponent(selectedVideo.id)}#music`);
    return;
  }
  const generation = ++loadGeneration;
  videoStart.disabled = true;
  videoStatus.textContent = '動画を読み込み中…';
  const fail = (reason) => {
    if (generation !== loadGeneration) return;
    resetVideo();
    videoStatus.textContent = `読み込み失敗：${reason?.data ? `YouTubeエラー ${reason.data}` : reason?.message || 'プレーヤーが15秒以内に応答しませんでした'}。再試行する`;
    console.warn('YouTube player failed', reason?.data || reason?.message || 'ready timeout');
  };
  loadTimer = setTimeout(fail, 15000);
  try {
    await loadYouTubeAPI();
    if (generation !== loadGeneration) return;
    const frame = document.createElement('iframe');
    frame.id = 'youtube-player';
    frame.title = `${compactTitle(selectedVideo.title)} YouTube動画プレイヤー`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = `https://www.youtube-nocookie.com/embed/${selectedVideo.id}?enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(location.origin)}`;
    videoHost.replaceChildren(frame);
    activePlayer = new YT.Player(frame, { events: {
      onReady(event) {
        if (generation !== loadGeneration) return;
        clearTimeout(loadTimer);
        videoStart.hidden = true;
        videoStatus.hidden = true;
        event.target.playVideo();
      },
      onError: fail
    }});
  } catch (error) { fail(error); }
});
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
  resetVideo();
  document.querySelector('#video-external').href = `https://www.youtube.com/watch?v=${encodeURIComponent(selectedVideo.id)}`;
}));

// Local files have no HTTP referrer, which YouTube requires for embedded playback.
// Keep playback inside the website by opening its local HTTP preview in this tab.
if (location.protocol === 'file:') {
  location.replace('http://127.0.0.1:8873/#music');
}
const requestedVideo = new URLSearchParams(location.search).get('video');
if (requestedVideo && /^[\w-]{11}$/.test(requestedVideo)) {
  const requestedCard = [...document.querySelectorAll('[data-youtube]')]
    .find(card => card.dataset.youtube === requestedVideo);
  if (requestedCard) requestedCard.click();
}

const profileAudio = document.querySelector('#profile-audio');
const audioToggle = document.querySelector('#audio-toggle');
const audioSeek = document.querySelector('#audio-seek');
const audioCurrent = document.querySelector('#audio-current');
const audioDuration = document.querySelector('#audio-duration');
let audioObjectUrl;
let audioSeekActive = false;

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds)) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function updateAudioProgress() {
  if (audioSeekActive) return;
  const progress = profileAudio.duration ? profileAudio.currentTime / profileAudio.duration * 100 : 0;
  audioSeek.value = String(progress);
  audioSeek.style.setProperty('--audio-progress', `${progress}%`);
  audioCurrent.textContent = formatAudioTime(profileAudio.currentTime);
}

profileAudio.addEventListener('loadedmetadata', () => {
  audioDuration.textContent = formatAudioTime(profileAudio.duration);
  audioToggle.disabled = false;
  audioSeek.disabled = false;
  updateAudioProgress();
});
profileAudio.addEventListener('timeupdate', updateAudioProgress);
profileAudio.addEventListener('play', () => {
  audioToggle.textContent = 'Ⅱ';
  audioToggle.setAttribute('aria-label', '音源を一時停止');
});
profileAudio.addEventListener('pause', () => {
  audioToggle.textContent = '▶';
  audioToggle.setAttribute('aria-label', '音源を再生');
});
profileAudio.addEventListener('ended', () => {
  profileAudio.currentTime = 0;
  updateAudioProgress();
});
audioToggle.addEventListener('click', () => {
  if (profileAudio.paused) profileAudio.play();
  else profileAudio.pause();
});
audioSeek.addEventListener('input', () => {
  if (!profileAudio.duration) return;
  const nextTime = Number(audioSeek.value) / 100 * profileAudio.duration;
  profileAudio.currentTime = nextTime;
  audioCurrent.textContent = formatAudioTime(nextTime);
  audioSeek.style.setProperty('--audio-progress', `${audioSeek.value}%`);
});
audioSeek.addEventListener('pointerdown', () => { audioSeekActive = true; });
audioSeek.addEventListener('pointerup', () => {
  audioSeekActive = false;
  if (profileAudio.duration) profileAudio.currentTime = Number(audioSeek.value) / 100 * profileAudio.duration;
  updateAudioProgress();
});
audioSeek.addEventListener('change', () => {
  audioSeekActive = false;
  if (profileAudio.duration) profileAudio.currentTime = Number(audioSeek.value) / 100 * profileAudio.duration;
  updateAudioProgress();
});

async function prepareProfileAudio() {
  const source = profileAudio.dataset.src;
  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`音源の読み込みに失敗しました (${response.status})`);
    const audioData = await response.arrayBuffer();
    audioObjectUrl = URL.createObjectURL(new Blob([audioData], { type: 'audio/mpeg' }));
    profileAudio.src = audioObjectUrl;
  } catch (error) {
    console.warn(error.message);
    profileAudio.src = source;
  }
  profileAudio.load();
}

prepareProfileAudio();
window.addEventListener('pagehide', () => {
  if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
});
