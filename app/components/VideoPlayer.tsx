import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

interface VideoPlayerProps {
  source: { uri: string };
  posterSource?: { uri: string };
  title?: string;
  autoplay?: boolean;
  showControls?: boolean;
  onComplete?: () => void;
  style?: any;
}

const VideoPlayer = ({
  source,
  posterSource,
  title,
  autoplay = false,
  showControls = true,
  onComplete,
  style,
}: VideoPlayerProps) => {
  const { colors } = useTheme();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get playback status
  const isPlaybackStatusUpdate = (status: any): status is AVPlaybackStatus => {
    return status !== null && !status.error;
  };

  // Handle video status update
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!isPlaybackStatusUpdate(status)) {
      setError("Video playback error");
      return;
    }

    setStatus(status);
    setIsLoading(!status.isLoaded || status.isBuffering);

    // Update playing state
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);

      // Handle video completion
      if (status.didJustFinish && onComplete) {
        onComplete();
      }
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
  };

  // Toggle mute
  const toggleMute = async () => {
    if (!videoRef.current) return;

    setIsMuted(!isMuted);
    await videoRef.current.setIsMutedAsync(!isMuted);
  };

  // Skip forward 10 seconds
  const skipForward = async () => {
    if (!videoRef.current || !status?.isLoaded) return;

    const newPosition = status.positionMillis + 10000;
    const duration = status.durationMillis || 0;

    await videoRef.current.setPositionAsync(Math.min(newPosition, duration));
  };

  // Skip backward 10 seconds
  const skipBackward = async () => {
    if (!videoRef.current || !status?.isLoaded) return;

    const newPosition = status.positionMillis - 10000;
    await videoRef.current.setPositionAsync(Math.max(newPosition, 0));
  };

  // Format time in MM:SS
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!status?.isLoaded) return 0;
    return ((status.positionMillis || 0) / (status.durationMillis || 1)) * 100;
  };

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={source}
          posterSource={posterSource}
          rate={1.0}
          volume={1.0}
          isMuted={isMuted}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoplay}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          style={styles.video}
          useNativeControls={false}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {showControls && status?.isLoaded && (
          <View style={styles.controlsOverlay}>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: colors.primary,
                    width: `${getProgressPercentage()}%`,
                  },
                ]}
              />
              <View style={styles.progressBackground} />
            </View>

            {/* Time display */}
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {status.positionMillis
                  ? formatTime(status.positionMillis)
                  : "0:00"}
              </Text>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {status.durationMillis
                  ? formatTime(status.durationMillis)
                  : "0:00"}
              </Text>
            </View>

            {/* Control buttons */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={skipBackward}
                style={styles.controlButton}
              >
                <SkipBack size={24} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.playButton}
              >
                {isPlaying ? (
                  <Pause size={28} color={colors.text} />
                ) : (
                  <Play size={28} color={colors.text} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={skipForward}
                style={styles.controlButton}
              >
                <SkipForward size={24} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleMute}
                style={styles.controlButton}
              >
                {isMuted ? (
                  <VolumeX size={24} color={colors.text} />
                ) : (
                  <Volume2 size={24} color={colors.text} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Maximize size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  title: {
    padding: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  videoContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    fontSize: 16,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    padding: 10,
  },
  progressContainer: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
  },
});

export default VideoPlayer;
