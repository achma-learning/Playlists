// Invidious instances (rotated automatically)
const INSTANCES = [
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://invidious.slipfox.xyz"
];

// Your playlists
const PLAYLISTS = [
  "PLN66g44xo3kmAuIfa7YbT6NonNyKTRVN4",
  "PLG573uUBOvv4zybEEZe-DY_gBkeYW5FYO",
  "PLDnQCZ0PAyUPdWqbD2d0-bVGNDSJaQ2W6"
];

// Max videos pulled from each playlist
const MAX_PER_PLAYLIST = 10;

// Pick a stable “daily random” seed
function dailySeed() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Shuffle but stable for the day
function seededShuffle(array, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
  }

  return array
    .map(v => ({ v, r: Math.sin(h++) }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.v);
}

async function fetchPlaylist(playlistId) {
  for (const base of INSTANCES) {
    try {
      const res = await fetch(`${base}/api/v1/playlists/${playlistId}`);
      if (!res.ok) continue;

      const data = await res.json();
      return data.videos.slice(0, MAX_PER_PLAYLIST);
    } catch (err) {
      // try next instance
    }
  }
  throw new Error("All Invidious instances failed");
}

async function loadVideos() {
  const container = document.getElementById("videos");
  container.innerHTML = "";

  let videos = [];

  for (const playlist of PLAYLISTS) {
    try {
      const list = await fetchPlaylist(playlist);
      videos.push(...list);
    } catch (e) {
      console.error("Failed playlist:", playlist);
    }
  }

  videos = seededShuffle(videos, dailySeed());

  for (const video of videos) {
    const div = document.createElement("div");
    div.className = "video";
    div.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${video.videoId}"
        loading="lazy"
        allowfullscreen>
      </iframe>
      <div class="title">${video.title}</div>
    `;
    container.appendChild(div);
  }
}

loadVideos();