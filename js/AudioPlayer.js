class AuidioPlayer {
    constructor(options = {}) {
    // Default configuration
    this.config = {
            playButtonSelector: '.play-button',
            trackIdAttribute: 'data-track-id',
            releaseIdAttribute: 'data-release-id',
            defaultVolume: 0.5,
            ...options
        };

        // Main audio player states
        this.state = {
            audio: new Audio(),
            currentTrack: null,
            playlist: [],
            isPlaying: false
        };

        // audio settings
        this.state.audio.volume = this.config.defaultVolume;

        // Bind methods to maintain context
        this.initializePlayer = this.initializePlayer.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
    }

    // Initinalizing the audio player and attaching the event listeners
    initializePlayer() {
        const playButtons = document.querySelectorAll(this.config.playButtonSelector);
        
        playButtons.forEach(button => {
            button.addEventListener('click', (event) => this.handlePlayPause(event));
        });


        // Handling errors
        this.state.audio.addEventListener('error', (e) => {
            console.error('Audio Error:', e);
            this.showErrorMessage('Unable to play audio');
        });

        // Auto-play when current track ends
        this.state.audio.addEventListener('ended', () => {
            this.playNextTrack();
        });
    }

    // Play/Pause
    handlePlayPause(event) {
        const button = event.currentTarget;
        const trackId = button.getAttribute(this.config.trackIdAttribute);
        const releaseId = button.getAttribute(this.config.releaseIdAttribute);

        // Clicking the same track
        if (this.isCurrentTrack(trackId, releaseId)) {
            this.togglePlayPause(button);
            return;
        }

        // Playing new track
        this.playTrack(button, trackId, releaseId);
    }

    // if the clicked track is currently playing
    isCurrentTrack(trackId, releaseId) {
        return this.state.currentTrack && 
               this.state.currentTrack.trackId === trackId && 
               this.state.currentTrack.releaseId === releaseId;
    }

    // play/pause for current track
    togglePlayPause(button) {
        if (this.state.isPlaying) {
            this.pauseTrack(button);
        } else {
            this.resumeTrack(button);
        }
    }

    // Play a new track
    playTrack(button, trackId, releaseId) {
        this.stopCurrentTrack();
        this.setButtonState(button, 'loading');

        const trackUrl = this.getTrackUrl(releaseId, trackId);

        try {
            // Set audio source aeiR-5AJ-jHB-q4Wnd play
            this.state.audio.src = trackUrl;
            this.state.audio.play()
                .then(() => {
                    this.state.isPlaying = true;
                    this.state.currentTrack = { button, trackId, releaseId };
                    this.setButtonState(button, 'playing');
                })
                .catch(error => {
                    console.error('Playback failed:', error);
                    this.showErrorMessage('Unable to play track');
                    this.setButtonState(button, 'paused');
                });
        } catch (error) {
            console.error('Track loading error:', error);
            this.showErrorMessage('Error loading track');
        }
    }

    // Stop currently playing track
    stopCurrentTrack() {
        if (this.state.currentTrack) {
            this.state.audio.pause();
            this.state.audio.currentTime = 0;
            this.setButtonState(this.state.currentTrack.button, 'paused');
        }
    }

    // Pause current track
    pauseTrack(button) {
        this.state.audio.pause();
        this.state.isPlaying = false;
        this.setButtonState(button, 'paused');
    }

    // Resume paused track
    resumeTrack(button) {
        this.state.audio.play()
            .then(() => {
                this.state.isPlaying = true;
                this.setButtonState(button, 'playing');
            })
            .catch(error => {
                console.error('Resume failed:', error);
                this.showErrorMessage('Unable to resume track');
            });
    }

    // Play next track in playlist
    playNextTrack() {
        // play next track logic ...debugging
        console.log('Playing next track');
    }

    // track URL
    getTrackUrl(releaseId, trackId) {
        return `/api/tracks/${releaseId}/${trackId}`;
    }

    // Updating button state
    setButtonState(button, state) {
        const iconMap = {
            'loading': '<i class="bx bxs-like bx-spin"></i>',
            'paused': '<i class="bx bx-play"></i>',
            'playing': '<i class="bx bx-pause"></i>'
        };

        button.innerHTML = iconMap[state] || '';
    }

    // Error message
    showErrorMessage(message) {
        alert(message);
    }

    // Volume control
    setVolume(volume) {
        // Ensuring volume is between 0 and 1
        this.state.audio.volume = Math.max(0, Math.min(1, volume));
    }
}

// Export for use in other files
export default AudioPlayer;
