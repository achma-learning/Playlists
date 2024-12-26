# Playlists
# code:
yt-dlp -f "bestvideo+bestaudio" -o "%(playlist_index)s - %(title)s.%(ext)s" https://www.youtube.com/playlist?list=PLAYLIST_ID
# Source
https://github.com/yt-dlp/yt-dlp
# How to :
Open Poweshell on windows then: type this: choco install yt-dlp
# Download :
Then open CMD and type the code "yt-dlp -f "bestvideo+bestaudio" -o "%(playlist_index)s - %(title)s.%(ext)s" https://www.youtube.com/playlist?list=PLAYLIST_ID" , make sure to replace this link: https://www.youtube.com/playlist?list=PLAYLIST_ID , with the corresponding link of the playlist

# ver2 :
yt-dlp -f "bestvideo+bestaudio" -o "C:\Users\Mohamed-Aymane\Videos\yt-dlp downloads\%(playlist_index)s - %(title)s.%(ext)s" https://www.youtube.com/playlist?list=PLAYLIST_ID

# ver3:
yt-dlp -f "bestvideo+bestaudio" -o "C:\Users\Mohamed-Aymane\Videos\yt-dlp downloads\%(playlist_index)s - %(title)s.%(ext)s" https://www.youtube.com/playlist?list=PLAYLIST_ID

# ver4:
yt-dlp --cookies "C:\Users\Mohamed-Aymane\Videos\cookies.txt" -f "bestvideo+bestaudio" -o "C:\Users\Mohamed-Aymane\Videos\yt-dlp downloads\%(playlist_index)s - %(title)s.%(ext)s" "https://www.youtube.com/watch?v=4SFK0DAeqeg"
