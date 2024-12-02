class MusicLibrary {
  constructor(rawData) {
    this.songs = this.parseSongData(rawData);
    this.currentPlaylist = this.songs;
  }

  parseSongData(rawData) {
    const songs = [];
    let currentSong = {};

    // Removing last quote at the end if present
    rawData = rawData.replace(/"$/, "");

    // Spliting data into key-value pairs
    const pairs = rawData.match(/(\w+)"([^"]+)"/g);

    pairs.forEach((pair, index) => {
      const [key, value] = pair.split('"').filter(Boolean);

      // getting the songs properties based on the key
      switch (key) {
        case "title":
          // Start of a new song
          if (Object.keys(currentSong).length > 0) {
            songs.push(currentSong);
          }
          currentSong = { title: value };
          break;
        case "artist":
          currentSong.artist = value;
          break;
        case "audioSource":
          currentSong.audioSource = value;
          break;
        case "albumArt":
          currentSong.albumArt = value;
          break;
      }

      // adding last song is added
      if (index === pairs.length - 1) {
        songs.push(currentSong);
      }
    });

    return songs;
  }

  renderPlaylist() {
    const playlistContainer = document.createElement("div");
    playlistContainer.className = "playlist";

    this.songs.forEach((song, index) => {
      const songElement = document.createElement("div");
      songElement.className = "song-item";
      songElement.innerHTML = `
                <button 
                    class="play-button" 
                    data-track-id="${index}" 
                    data-release-id="album"
                >
                    <img src="${song.albumArt}" alt="Album Art" class="album-art">
                    <div class="song-details">
                        <span class="song-title">${song.title}</span>
                        <span class="song-artist">${song.artist}</span>
                    </div>
                    <i class="fas fa-play"></i>
                </button>
            `;
      playlistContainer.appendChild(songElement);
    });

    return playlistContainer;
  }

  // Enhance AudioPlayer to work with parsed songs
  enhanceAudioPlayer(audioPlayer) {
    audioPlayer.getTrackUrl = (releaseId, trackId) => {
      return this.songs[trackId].audioSource;
    };

    audioPlayer.showTrackMetadata = (trackId) => {
      const song = this.songs[trackId];
      const metadataContainer = document.querySelector(".track-metadata");

      if (metadataContainer) {
        metadataContainer.innerHTML = `
                    <img src="${song.albumArt}" alt="${song.title}">
                    <div>
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>
                `;
      }
    };

    const originalPlayTrack = audioPlayer.playTrack.bind(audioPlayer);
    audioPlayer.playTrack = (button, trackId, releaseId) => {
      originalPlayTrack(button, trackId, releaseId);
      this.enhanceAudioPlayer.showTrackMetadata(trackId);
    };
  }
}

function initializeMusicPlayer(rawSongData) {
  const musicLibrary = new MusicLibrary(rawSongData);
  const audioPlayer = new AudioPlayer();
  musicLibrary.enhanceAudioPlayer(audioPlayer);

  // Rendering playlist
  const playlistContainer = document.querySelector(".track-list");
  playlistContainer.appendChild(musicLibrary.renderPlaylist());

  // envoking the player
  audioPlayer.initializePlayer();
  return { musicLibrary, audioPlayer };
}
export { MusicLibrary, initializeMusicPlayer };
