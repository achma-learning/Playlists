document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid-container');

    // Invidious instances for fallback mechanism
    const INSTANCES = [
        "https://yewtu.be",
        "https://vid.puffyan.us",
        "https://invidious.slipfox.xyz"
    ];

    // Max videos to pull from each playlist
    const MAX_PER_PLAYLIST = 15;

    /**
     * Creates a seed for randomization based on the current date.
     * Ensures the shuffle is the same for the entire day.
     */
    function dailySeed() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }

    /**
     * Shuffles an array in a deterministic way based on a seed.
     * @param {Array} array The array to shuffle.
     * @param {string} seed The seed for shuffling.
     * @returns {Array} The shuffled array.
     */
    function seededShuffle(array, seed) {
        let h = 0;
        for (let i = 0; i < seed.length; i++) {
            h = Math.imul(31, h) + seed.charCodeAt(i);
        }

        return [...array]
            .map(v => ({ v, r: Math.sin(h++) }))
            .sort((a, b) => a.r - b.r)
            .map(item => item.v);
    }

    /**
     * Extracts the playlist ID from a full YouTube playlist URL.
     * @param {string} url The YouTube playlist URL.
     * @returns {string|null} The playlist ID or null if not found.
     */
    function extractPlaylistId(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.searchParams.get('list');
        } catch (e) {
            console.error('Invalid URL:', url);
            return null;
        }
    }

    /**
     * Fetches the list of playlist URLs from the playlists.txt file.
     * @returns {Promise<string[]>} A promise that resolves to an array of playlist URLs.
     */
    async function getPlaylistUrls() {
        try {
            const response = await fetch('playlists.txt');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const text = await response.text();
            return text.split('\n').map(line => line.trim()).filter(Boolean);
        } catch (error) {
            console.error('Failed to fetch playlists.txt:', error);
            videoGrid.innerHTML = '<p style="color: var(--secondary-text-color);">Could not load playlists. Please ensure the playlists.txt file exists.</p>';
            return [];
        }
    }

    /**
     * Fetches videos from a single playlist using the Invidious API.
     * @param {string} playlistId The ID of the playlist.
     * @returns {Promise<Object[]>} A promise that resolves to an array of video objects.
     */
    async function fetchPlaylistVideos(playlistId) {
        for (const instance of INSTANCES) {
            try {
                const url = `${instance}/api/v1/playlists/${playlistId}`;
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Instance ${instance} failed for playlist ${playlistId}.`);
                    continue; // Try the next instance
                }
                const data = await response.json();
                return data.videos.slice(0, MAX_PER_PLAYLIST);
            } catch (err) {
                console.warn(`Error with instance ${instance}:`, err);
            }
        }
        throw new Error(`All instances failed for playlist ${playlistId}`);
    }

    /**
     * Renders the video grid on the page.
     * @param {Array<Object>} videos The array of video objects to render.
     */
    function renderVideos(videos) {
        if (!videos.length) {
            videoGrid.innerHTML = '<p style="color: var(--secondary-text-color);">No videos found or failed to load from playlists.</p>';
            return;
        }

        videoGrid.innerHTML = ''; // Clear previous content

        for (const video of videos) {
            const videoElement = document.createElement('div');
            videoElement.className = 'video';
            
            const thumbnailUrl = video.videoThumbnails.find(t => t.quality === 'medium')?.url || video.videoThumbnails[0]?.url;

            videoElement.innerHTML = `
                <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                    <div class="video-thumbnail" style="background-image: url('${thumbnailUrl}')"></div>
                    <p class="video-title">${video.title}</p>
                </a>
            `;
            videoGrid.appendChild(videoElement);
        }
    }
    
    /**
     * Main function to initialize the application.
     */
    async function main() {
        const playlistUrls = await getPlaylistUrls();
        const playlistIds = playlistUrls.map(extractPlaylistId).filter(Boolean);

        if (!playlistIds.length) return;

        let allVideos = [];
        try {
            const videoPromises = playlistIds.map(fetchPlaylistVideos);
            const results = await Promise.allSettled(videoPromises);

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    allVideos.push(...result.value);
                } else if (result.status === 'rejected') {
                    console.error('A playlist failed to load:', result.reason);
                }
            });

            // Remove duplicate videos that might be in multiple playlists
            const uniqueVideos = Array.from(new Map(allVideos.map(v => [v.videoId, v])).values());
            
            const shuffledVideos = seededShuffle(uniqueVideos, dailySeed());
            
            renderVideos(shuffledVideos);

        } catch (error) {
            console.error("Failed to load and render videos:", error);
            videoGrid.innerHTML = '<p style="color: var(--secondary-text-color);">A critical error occurred while loading videos.</p>';
        }
    }

    main();
});
