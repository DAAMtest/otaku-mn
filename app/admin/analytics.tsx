import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Calendar,
  Film,
  Heart,
  Download,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import useAnimeData from "@/hooks/useAnimeData";

// Mock data for charts
const generateMockData = (days: number, min: number, max: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split("T")[0],
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  });
};

const mockUserData = generateMockData(7, 5, 20);
const mockViewData = generateMockData(7, 50, 200);
const mockDownloadData = generateMockData(7, 2, 15);

// Simple bar chart component
const BarChart = ({ data, color }: { data: any[]; color: string }) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const { width } = Dimensions.get("window");
  const chartWidth = width - 64; // Accounting for padding
  const barWidth = chartWidth / data.length - 8;

  return (
    <View className="mt-2">
      <View className="h-[150px] flex-row items-end justify-between">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 130;
          return (
            <View key={index} style={{ width: barWidth }}>
              <View
                style={{
                  height: barHeight,
                  backgroundColor: color,
                  borderRadius: 4,
                }}
              />
              <Text className="text-gray-400 text-xs mt-1 text-center">
                {item.date.split("-")[2]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Analytics dashboard for administrators to view app usage statistics.
 */
export default function AnalyticsDashboard() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { trendingAnime } = useAnimeData();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [stats, setStats] = useState({
    totalUsers: 128,
    activeUsers: 87,
    totalViews: 1243,
    totalAnime: 42,
    totalGenres: 8,
    popularAnime: [
      { id: "3", title: "Demon Slayer", views: 342 },
      { id: "1", title: "Attack on Titan", views: 287 },
      { id: "5", title: "Jujutsu Kaisen", views: 231 },
      { id: "2", title: "My Hero Academia", views: 198 },
      { id: "8", title: "Fullmetal Alchemist: Brotherhood", views: 176 },
    ],
  });

  // Check authentication and fetch analytics data on component mount
  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    fetchAnalyticsData();
  }, [timeRange, session, router]);

  // Fetch analytics data from API (mock for now)
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from the database
      // const { data, error } = await supabase.rpc('get_analytics_data', { time_range: timeRange });
      // if (error) throw error;
      // setStats(data);

      // For demo, simulate loading
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setLoading(false);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">
            Analytics Dashboard
          </Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#40C057" />
            <Text className="text-gray-400 mt-4">
              Loading analytics data...
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 p-4">
            {/* Time Range Selector */}
            <View className="flex-row bg-gray-800 rounded-lg p-1 mb-4">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${timeRange === "week" ? "bg-green-600" : ""}`}
                onPress={() => setTimeRange("week")}
              >
                <Text
                  className={`text-center ${timeRange === "week" ? "text-white" : "text-gray-400"}`}
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${timeRange === "month" ? "bg-green-600" : ""}`}
                onPress={() => setTimeRange("month")}
              >
                <Text
                  className={`text-center ${timeRange === "month" ? "text-white" : "text-gray-400"}`}
                >
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${timeRange === "year" ? "bg-green-600" : ""}`}
                onPress={() => setTimeRange("year")}
              >
                <Text
                  className={`text-center ${timeRange === "year" ? "text-white" : "text-gray-400"}`}
                >
                  Year
                </Text>
              </TouchableOpacity>
            </View>

            {/* Overview Stats */}
            <Text className="text-white font-bold text-lg mb-3">Overview</Text>
            <View className="flex-row flex-wrap justify-between mb-6">
              <View className="w-[48%] bg-gray-800 rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-400">Total Users</Text>
                  <Users size={20} color="#60A5FA" />
                </View>
                <Text className="text-blue-400 font-bold text-2xl mt-2">
                  {stats.totalUsers}
                </Text>
              </View>
              <View className="w-[48%] bg-gray-800 rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-400">Active Users</Text>
                  <Users size={20} color="#34D399" />
                </View>
                <Text className="text-green-400 font-bold text-2xl mt-2">
                  {stats.activeUsers}
                </Text>
              </View>
              <View className="w-[48%] bg-gray-800 rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-400">Total Views</Text>
                  <Eye size={20} color="#A78BFA" />
                </View>
                <Text className="text-purple-400 font-bold text-2xl mt-2">
                  {stats.totalViews}
                </Text>
              </View>
              <View className="w-[48%] bg-gray-800 rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-400">Anime Titles</Text>
                  <Film size={20} color="#F59E0B" />
                </View>
                <Text className="text-amber-400 font-bold text-2xl mt-2">
                  {stats.totalAnime}
                </Text>
              </View>
            </View>

            {/* User Activity Chart */}
            <View className="bg-gray-800 rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold">User Activity</Text>
                <Users size={18} color="#60A5FA" />
              </View>
              <Text className="text-gray-400 text-xs mb-2">
                New user registrations
              </Text>
              <BarChart data={mockUserData} color="#60A5FA" />
            </View>

            {/* View Count Chart */}
            <View className="bg-gray-800 rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold">View Count</Text>
                <Eye size={18} color="#A78BFA" />
              </View>
              <Text className="text-gray-400 text-xs mb-2">
                Total video views per day
              </Text>
              <BarChart data={mockViewData} color="#A78BFA" />
            </View>

            {/* Downloads Chart */}
            <View className="bg-gray-800 rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold">Downloads</Text>
                <Download size={18} color="#34D399" />
              </View>
              <Text className="text-gray-400 text-xs mb-2">
                Offline downloads per day
              </Text>
              <BarChart data={mockDownloadData} color="#34D399" />
            </View>

            {/* Popular Anime */}
            <Text className="text-white font-bold text-lg mb-3">
              Popular Anime
            </Text>
            <View className="bg-gray-800 rounded-lg p-4 mb-6">
              {stats.popularAnime.map((anime, index) => (
                <View
                  key={anime.id}
                  className={`flex-row items-center justify-between py-3 ${index < stats.popularAnime.length - 1 ? "border-b border-gray-700" : ""}`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-gray-400 w-6">{index + 1}.</Text>
                    <Text className="text-white">{anime.title}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-purple-400 mr-2">{anime.views}</Text>
                    <Eye size={16} color="#A78BFA" />
                  </View>
                </View>
              ))}
            </View>

            {/* Export Data Button */}
            <TouchableOpacity
              className="bg-green-600 rounded-lg py-3 items-center mb-6"
              onPress={() => {
                // In a real app, this would export analytics data
                alert("This would export analytics data in a real app");
              }}
            >
              <Text className="text-white font-semibold">
                Export Analytics Data
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
