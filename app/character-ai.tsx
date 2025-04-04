import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { Send, Trash2 } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
// Import Haptics conditionally to avoid dependency issues
let Haptics: any = {
  impactAsync: () => Promise.resolve(),
  notificationAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: { Light: null },
  NotificationFeedbackType: { Warning: null },
};

// We'll try to import the actual module only if it's available
try {
  if (Platform.OS !== "web") {
    // Dynamic import to avoid dependency issues
    import("expo-haptics")
      .then((module) => {
        Haptics = module;
      })
      .catch((err) => {
        console.log("Haptics not available", err);
      });
  }
} catch (error) {
  console.log("Error importing Haptics", error);
}

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Sample anime recommendations based on genres
const animeRecommendations = {
  action: [
    "Demon Slayer",
    "Attack on Titan",
    "Jujutsu Kaisen",
    "My Hero Academia",
  ],
  romance: ["Your Name", "Horimiya", "Fruits Basket", "Toradora"],
  comedy: [
    "One Punch Man",
    "Konosuba",
    "Spy x Family",
    "Kaguya-sama: Love is War",
  ],
  fantasy: [
    "Mushoku Tensei",
    "Re:Zero",
    "Sword Art Online",
    "That Time I Got Reincarnated as a Slime",
  ],
  scifi: ["Steins;Gate", "Psycho-Pass", "Ghost in the Shell", "Cowboy Bebop"],
  drama: [
    "Violet Evergarden",
    "Your Lie in April",
    "A Silent Voice",
    "March Comes in Like a Lion",
  ],
  mystery: ["Death Note", "Erased", "The Promised Neverland", "Monster"],
  horror: ["Tokyo Ghoul", "Parasyte", "Another", "Hellsing Ultimate"],
  sports: ["Haikyuu!!", "Kuroko's Basketball", "Yuri on Ice", "Free!"],
  slice: ["K-On!", "Non Non Biyori", "Laid-Back Camp", "Barakamon"],
};

// Generate a more intelligent response based on user input
const generateAIResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();

  // Check for greetings
  if (input.match(/^(hi|hello|hey|greetings)/)) {
    return "Hello! I'm your Anime Assistant. I can recommend anime, explain genres, or discuss popular series. What would you like to know about?";
  }

  // Check for genre recommendations
  for (const [genre, animes] of Object.entries(animeRecommendations)) {
    if (input.includes(genre)) {
      const randomAnimes = [...animes]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      return `For ${genre} anime, I'd recommend: ${randomAnimes.join(", ")}. Would you like more specific recommendations or details about any of these?`;
    }
  }

  // Check for specific anime inquiries
  const allAnime = Object.values(animeRecommendations).flat();
  for (const anime of allAnime) {
    if (input.includes(anime.toLowerCase())) {
      return `${anime} is a great choice! Would you like to know more about it, or would you prefer similar recommendations?`;
    }
  }

  // Check for questions about watching
  if (
    input.includes("where") &&
    (input.includes("watch") || input.includes("stream"))
  ) {
    return "You can watch anime on platforms like Crunchyroll, Funimation, Netflix, or Hulu. Many of these offer free trials if you're looking to explore their libraries.";
  }

  // Check for questions about recommendations
  if (input.includes("recommend") || input.includes("suggestion")) {
    return "I'd be happy to recommend some anime! Could you tell me what genres you enjoy? For example: action, romance, comedy, fantasy, sci-fi, drama, mystery, horror, sports, or slice of life?";
  }

  // Default response
  return `I understand you're interested in "${userInput}". To give you better recommendations, could you tell me what genres or themes you enjoy in anime? Or if you have a favorite series, I can suggest similar ones!`;
};

export default function CharacterAIScreen() {
  const { colors } = useTheme();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am Anime Assistant. How can I help you with anime recommendations today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const flatListRef = useRef<FlatList>(null);
  const params = useLocalSearchParams();
  const fromTab = params.from === "tab";

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;

    // Provide haptic feedback when sending message
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log("Haptics feedback failed", error);
      }
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with typing indicator
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);

    // Dismiss keyboard on mobile
    Keyboard.dismiss();
  };

  const clearChat = () => {
    // Provide haptic feedback when clearing chat
    if (Platform.OS !== "web") {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log("Haptics notification failed", error);
      }
    }

    setMessages([
      {
        id: Date.now().toString(),
        text: "Chat cleared. How can I help you with anime recommendations today?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser
          ? [styles.userMessage, { backgroundColor: colors.primary }]
          : [styles.aiMessage, { backgroundColor: "#333" }],
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Anime Assistant
        </Text>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Trash2 size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted={false}
      />

      {isTyping && (
        <View style={[styles.typingIndicator, { backgroundColor: "#333" }]}>
          <Text style={styles.typingText}>Anime Assistant is typing</Text>
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.typingDots}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, backgroundColor: "#333" },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about anime..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: input.trim() ? colors.primary : "#555" },
          ]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    padding: 8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "85%",
    minWidth: 80,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  aiMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 16,
    marginBottom: 8,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  typingText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 24,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
