import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Download,
  X,
  Subtitles,
} from "lucide-react-native";

interface VideoPlayerProps {
  uri: string;
  title?: string;
  episodeInfo?: string;
  thumbnailUri?: string;
  onClose?: () => void;
  animeId?: string;
  episodeId?: string;
  subtitles?: Array<{ language: string; uri: string }>;
  nextEpisodeCallback?: () => void;
  allowDownload?: boolean;
}

interface QualityOption {
  label: string;
  value: string;
}

const CONTINUE_WATCHING_KEY = "CONTINUE_WATCHING";
const SKIP_INTRO_DURATION = 90; // 90 seconds

/**
 * Netflix-like video player component with custom controls and advanced features
 */
const VideoPlayer = ({
  uri,
  title = "Untitled Anime",
  episodeInfo = "Episode 1",
  thumbnailUri,
  onClose,
  animeId = "1",
  episodeId = "1",
  subtitles = [],
  nextEpisodeCallback,
  allowDownload = false,
}: VideoPlayerProps) => {
  const videoRef = useRef<Video>(null);
  const { colors } = useTheme();
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const qualityOptions: QualityOption[] = [
    { label: "Auto", value: "auto" },
    { label: "1080p", value: "1080p" },
    { label: "720p", value: "720p" },
    { label: "480p", value: "480p" },
    { label: "360p", value: "360p" },
  ];

  // Initialize player and load saved position
  useEffect(() => {
    loadSavedPosition();
    return () => {
      // Save position when component unmounts
      if (position > 0 && duration > 0) {
        saveWatchingProgress();
      }
      // Reset screen orientation when unmounting
      if (Platform.OS !== "web") {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
      }
    };
  }, []);

  // Handle controls visibility timeout
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Show skip intro button at appropriate time
  useEffect(() => {
    if (position > 30 && position < SKIP_INTRO_DURATION) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }
  }, [position]);

  // Load saved position from AsyncStorage
  const loadSavedPosition = async () => {
    try {
      const savedData = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
      if (savedData) {
        const watchHistory = JSON.parse(savedData);
        const currentAnimeEpisode = watchHistory.find(
          (item: any) =>
            item.animeId === animeId && item.episodeId === episodeId,
        );
        if (currentAnimeEpisode && videoRef.current) {
          // If the saved position is near the end, start from beginning
          if (
            currentAnimeEpisode.position > 0 &&
            currentAnimeEpisode.duration > 0 &&
            currentAnimeEpisode.position / currentAnimeEpisode.duration < 0.95
          ) {
            videoRef.current.setPositionAsync(currentAnimeEpisode.position);
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved position:", error);
    }
  };

  // Save watching progress to AsyncStorage
  const saveWatchingProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
      let watchHistory = savedData ? JSON.parse(savedData) : [];

      // Find if this anime/episode is already in history
      const existingIndex = watchHistory.findIndex(
        (item: any) => item.animeId === animeId && item.episodeId === episodeId,
      );

      const watchData = {
        animeId,
        episodeId,
        title,
        episodeInfo,
        thumbnailUri,
        position,
        duration,
        timestamp: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        watchHistory[existingIndex] = watchData;
      } else {
        // Add to history, limit to 20 items
        watchHistory.unshift(watchData);
        if (watchHistory.length > 20) {
          watchHistory = watchHistory.slice(0, 20);
        }
      }

      await AsyncStorage.setItem(
        CONTINUE_WATCHING_KEY,
        JSON.stringify(watchHistory),
      );
    } catch (error) {
      console.error("Error saving watching progress:", error);
    }
  };

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoading(true);
      if (status.error) {
        setError(`Error: ${status.error}`);
      }
      return;
    }

    setStatus(status);
    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis || 0);
    setIsBuffering(status.isBuffering);
    setIsLoading(false);

    // Save progress every 10 seconds
    if (status.positionMillis % 10000 < 500) {
      saveWatchingProgress();
    }

    // Auto-play next episode if available
    if (status.didJustFinish && nextEpisodeCallback && !status.isLooping) {
      nextEpisodeCallback();
    }
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek forward 10 seconds
  const seekForward = async () => {
    if (!videoRef.current || !status?.isLoaded) return;
    const newPosition = Math.min(position + 10000, duration);
    await videoRef.current.setPositionAsync(newPosition);
    setPosition(newPosition);
  };

  // Seek backward 10 seconds
  const seekBackward = async () => {
    if (!videoRef.current || !status?.isLoaded) return;
    const newPosition = Math.max(position - 10000, 0);
    await videoRef.current.setPositionAsync(newPosition);
    setPosition(newPosition);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = async () => {
    if (Platform.OS === "web") {
      setIsFullscreen(!isFullscreen);
      return;
    }

    if (isFullscreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    }
    setIsFullscreen(!isFullscreen);
  };

  // Toggle mute
  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  // Skip intro
  const skipIntro = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(SKIP_INTRO_DURATION * 1000);
    setShowSkipIntro(false);
  };

  // Format time (milliseconds to MM:SS)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Change video quality
  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    // In a real implementation, you would switch to a different video source
    // based on the selected quality
    setShowSettings(false);
  };

  // Change subtitle
  const changeSubtitle = (language: string) => {
    setSelectedSubtitle(language);
    setShowSubtitles(false);
  };

  // Download video for offline viewing
  const downloadVideo = async () => {
    // In a real implementation, you would use expo-file-system to download
    // the video file and store it locally
    console.log("Downloading video for offline viewing");
    // Show a toast or notification to the user
  };

  return (
    <View
      style={[styles.container, isFullscreen && styles.fullscreenContainer]}
    >
      <StatusBar hidden={isFullscreen} />

      {/* Video Player */}
      <Pressable
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)}
      >
        {thumbnailUri && isLoading && (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}

        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          useNativeControls={false}
          shouldPlay={false}
          isMuted={isMuted}
        />

        {isBuffering && !isLoading && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography
              variant="bodySmall"
              color={colors.text}
              style={styles.loadingText}
            >
              Loading video...
            </Typography>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Typography
              variant="body"
              color={colors.error}
              style={styles.errorText}
            >
              {error}
            </Typography>
          </View>
        )}
      </Pressable>

      {/* Custom Controls */}
      {showControls && (
        <View style={styles.controlsContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Typography variant="bodyLarge" color="white" weight="600">
                {title}
              </Typography>
              <Typography variant="bodySmall" color="white">
                {episodeInfo}
              </Typography>
            </View>

            <View style={styles.topRightButtons}>
              {allowDownload && (
                <TouchableOpacity
                  onPress={downloadVideo}
                  style={styles.iconButton}
                >
                  <Download size={20} color="white" />
                </TouchableOpacity>
              )}

              {subtitles.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowSubtitles(!showSubtitles)}
                  style={styles.iconButton}
                >
                  <Subtitles size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Center Play/Pause Button */}
          <View style={styles.centerControls}>
            <TouchableOpacity onPress={seekBackward} style={styles.seekButton}>
              <SkipBack size={28} color="white" />
              <Typography
                variant="caption"
                color="white"
                style={styles.seekText}
              >
                10s
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playPauseButton}
            >
              {isPlaying ? (
                <Pause size={36} color="white" />
              ) : (
                <Play size={36} color="white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={seekForward} style={styles.seekButton}>
              <SkipForward size={28} color="white" />
              <Typography
                variant="caption"
                color="white"
                style={styles.seekText}
              >
                10s
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.progressContainer}>
              <Typography variant="caption" color="white">
                {formatTime(position)}
              </Typography>

              <Slider
                style={styles.progressBar}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onValueChange={(value) => setPosition(value)}
                onSlidingComplete={(value) => {
                  if (videoRef.current) {
                    videoRef.current.setPositionAsync(value);
                  }
                }}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor={colors.primary}
              />

              <Typography variant="caption" color="white">
                {formatTime(duration)}
              </Typography>
            </View>

            <View style={styles.bottomButtons}>
              <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                {isMuted ? (
                  <VolumeX size={20} color="white" />
                ) : (
                  <Volume2 size={20} color="white" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSettings(!showSettings)}
                style={styles.iconButton}
              >
                <Settings size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFullscreen}
                style={styles.iconButton}
              >
                {isFullscreen ? (
                  <Minimize size={20} color="white" />
                ) : (
                  <Maximize size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <TouchableOpacity
          onPress={skipIntro}
          style={[styles.skipIntroButton, { backgroundColor: colors.primary }]}
        >
          <Typography variant="bodySmall" color="white" weight="600">
            Skip Intro
          </Typography>
        </TouchableOpacity>
      )}

      {/* Quality Settings Menu */}
      {showSettings && (
        <View style={styles.settingsMenu}>
          <Typography
            variant="bodyLarge"
            color="white"
            weight="600"
            style={styles.settingsTitle}
          >
            Video Quality
          </Typography>
          {qualityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.settingsOption,
                selectedQuality === option.value && styles.selectedOption,
              ]}
              onPress={() => changeQuality(option.value)}
            >
              <Typography
                variant="body"
                color={
                  selectedQuality === option.value ? colors.primary : "white"
                }
              >
                {option.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Subtitles Menu */}
      {showSubtitles && (
        <View style={styles.settingsMenu}>
          <Typography
            variant="bodyLarge"
            color="white"
            weight="600"
            style={styles.settingsTitle}
          >
            Subtitles
          </Typography>
          <TouchableOpacity
            style={[
              styles.settingsOption,
              selectedSubtitle === "" && styles.selectedOption,
            ]}
            onPress={() => changeSubtitle("")}
          >
            <Typography
              variant="body"
              color={selectedSubtitle === "" ? colors.primary : "white"}
            >
              Off
            </Typography>
          </TouchableOpacity>
          {subtitles.map((subtitle) => (
            <TouchableOpacity
              key={subtitle.language}
              style={[
                styles.settingsOption,
                selectedSubtitle === subtitle.language && styles.selectedOption,
              ]}
              onPress={() => changeSubtitle(subtitle.language)}
            >
              <Typography
                variant="body"
                color={
                  selectedSubtitle === subtitle.language
                    ? colors.primary
                    : "white"
                }
              >
                {subtitle.language}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
  },
  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  thumbnail: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "space-between",
    padding: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  closeButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  topRightButtons: {
    flexDirection: "row",
  },
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 40,
    padding: 12,
    marginHorizontal: 24,
  },
  seekButton: {
    alignItems: "center",
  },
  seekText: {
    marginTop: 4,
  },
  bottomControls: {
    width: "100%",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  iconButton: {
    padding: 8,
    marginLeft: 16,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 2,
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
  },
  skipIntroButton: {
    position: "absolute",
    bottom: 100,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  settingsMenu: {
    position: "absolute",
    right: 16,
    bottom: 70,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 8,
    padding: 16,
    width: 200,
  },
  settingsTitle: {
    marginBottom: 12,
  },
  settingsOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  selectedOption: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default VideoPlayer;
