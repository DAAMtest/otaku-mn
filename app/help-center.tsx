import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  Download,
  CreditCard,
  Play,
  User,
  ChevronRight,
  MessageCircle,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

export default function HelpCenterScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // FAQ categories
  const faqCategories = [
    {
      title: "Account & Profile",
      icon: <User size={20} color={colors.primary} />,
      questions: 12,
    },
    {
      title: "Playback Issues",
      icon: <Play size={20} color={colors.primary} />,
      questions: 8,
    },
    {
      title: "Downloads",
      icon: <Download size={20} color={colors.primary} />,
      questions: 6,
    },
    {
      title: "Billing & Subscription",
      icon: <CreditCard size={20} color={colors.primary} />,
      questions: 10,
    },
  ];

  // Popular FAQs
  const popularFaqs = [
    "How do I reset my password?",
    "Why can't I play videos?",
    "How to download episodes for offline viewing?",
    "How do I cancel my subscription?",
    "Why am I seeing buffering issues?",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            width: "100%",
            height: 60,
            backgroundColor: colors.background,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}
          >
            Help Center
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.card,
                borderRadius: 8,
                paddingHorizontal: 12,
                marginBottom: 16,
              }}
            >
              <Search size={20} color={colors.text + "80"} />
              <TextInput
                style={{
                  flex: 1,
                  color: colors.text,
                  padding: 12,
                }}
                placeholder="Search for help"
                placeholderTextColor={colors.text + "80"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* FAQ Categories */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Help Categories
            </Text>

            {faqCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {category.icon}
                  <Text
                    style={{
                      color: colors.text,
                      marginLeft: 12,
                      fontSize: 16,
                    }}
                  >
                    {category.title}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      color: colors.text + "80",
                      marginRight: 8,
                      fontSize: 14,
                    }}
                  >
                    {category.questions} articles
                  </Text>
                  <ChevronRight size={20} color={colors.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular FAQs */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Popular Questions
            </Text>

            {popularFaqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <HelpCircle size={20} color={colors.primary} />
                <Text
                  style={{
                    color: colors.text,
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  {faq}
                </Text>
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Support */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Still Need Help?
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                backgroundColor: colors.primary,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <MessageCircle size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  marginLeft: 12,
                  fontWeight: "bold",
                }}
              >
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
