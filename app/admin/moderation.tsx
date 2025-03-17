import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  X,
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Shield,
  Filter,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface ReportedContent {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  reported_by: string;
  reported_at: string;
  status: string;
  title?: string;
  image_url?: string;
  reporter_name?: string;
}

/**
 * Content moderation screen for administrators to review and handle reported content.
 */
export default function ContentModeration() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportedContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Mock data for demonstration
  const mockReports: ReportedContent[] = [
    {
      id: "1",
      content_type: "anime",
      content_id: "3",
      reason: "Inappropriate content for age rating",
      reported_by: "user123",
      reported_at: new Date().toISOString(),
      status: "pending",
      title: "Demon Slayer",
      image_url:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      reporter_name: "John Doe",
    },
    {
      id: "2",
      content_type: "comment",
      content_id: "15",
      reason: "Offensive language",
      reported_by: "user456",
      reported_at: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
      title: "Comment on Attack on Titan",
      reporter_name: "Jane Smith",
    },
    {
      id: "3",
      content_type: "user",
      content_id: "user789",
      reason: "Inappropriate username",
      reported_by: "user101",
      reported_at: new Date(Date.now() - 172800000).toISOString(),
      status: "approved",
      title: "User: ToxicFan123",
      reporter_name: "Admin User",
    },
    {
      id: "4",
      content_type: "anime",
      content_id: "7",
      reason: "Incorrect genre classification",
      reported_by: "user202",
      reported_at: new Date(Date.now() - 259200000).toISOString(),
      status: "rejected",
      title: "Tokyo Ghoul",
      image_url:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
      reporter_name: "Anime Expert",
    },
  ];

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports when search query or filter status changes
  useEffect(() => {
    let filtered = [...reports];

    // Apply status filter if set
    if (filterStatus) {
      filtered = filtered.filter((report) => report.status === filterStatus);
    }

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.reporter_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredReports(filtered);
  }, [searchQuery, reports, filterStatus]);

  // Fetch reports from API (mock for now)
  const fetchReports = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from the database
      // const { data, error } = await supabase
      //   .from('content_reports')
      //   .select('*')
      //   .order('reported_at', { ascending: false });

      // if (error) throw error;

      // For demo, use mock data
      setReports(mockReports);
      setFilteredReports(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to fetch reported content");
    } finally {
      setLoading(false);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle report action (approve or reject)
  const handleReportAction = async (
    reportId: string,
    action: "approve" | "reject",
  ) => {
    try {
      // In a real app, you would update the database
      // const { error } = await supabase
      //   .from('content_reports')
      //   .update({ status: action === 'approve' ? 'approved' : 'rejected' })
      //   .eq('id', reportId);

      // if (error) throw error;

      // Update local state
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: action === "approve" ? "approved" : "rejected",
              }
            : report,
        ),
      );

      Alert.alert(
        "Success",
        `Report ${action === "approve" ? "approved" : "rejected"} successfully`,
      );

      // Close modal if open
      if (modalVisible) {
        setModalVisible(false);
        setSelectedReport(null);
        setAdminNote("");
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      Alert.alert("Error", `Failed to ${action} report`);
    }
  };

  // View report details
  const handleViewReport = (report: ReportedContent) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600/30 text-green-400";
      case "rejected":
        return "bg-red-600/30 text-red-400";
      default:
        return "bg-yellow-600/30 text-yellow-400";
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "anime":
        return <Film size={20} color="#60A5FA" />;
      case "comment":
        return <MessageSquare size={20} color="#A78BFA" />;
      case "user":
        return <User size={20} color="#F87171" />;
      default:
        return <Flag size={20} color="#F59E0B" />;
    }
  };

  // Render report item
  const renderReportItem = ({ item }: { item: ReportedContent }) => (
    <TouchableOpacity
      className="bg-gray-800 rounded-lg p-4 mb-3"
      onPress={() => handleViewReport(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="w-16 h-16 rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-md bg-gray-700 items-center justify-center">
            {getContentTypeIcon(item.content_type)}
          </View>
        )}

        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-start">
            <Text className="text-white font-semibold" numberOfLines={1}>
              {item.title || `${item.content_type} #${item.content_id}`}
            </Text>
            <View
              className={`rounded-full px-2 py-0.5 ${getStatusColor(item.status).split(" ")[0]}`}
            >
              <Text
                className={`text-xs ${getStatusColor(item.status).split(" ")[1]}`}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <Text className="text-gray-400 text-xs mt-1">
            Reported by: {item.reporter_name}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            {new Date(item.reported_at).toLocaleString()}
          </Text>
          <Text className="text-gray-300 mt-2" numberOfLines={2}>
            {item.reason}
          </Text>
        </View>
      </View>

      {item.status === "pending" && (
        <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-700">
          <TouchableOpacity
            className="bg-green-600/30 rounded-lg px-3 py-1 mr-2 flex-row items-center"
            onPress={() => handleReportAction(item.id, "approve")}
          >
            <CheckCircle size={16} color="#10B981" />
            <Text className="text-green-400 ml-1">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-600/30 rounded-lg px-3 py-1 flex-row items-center"
            onPress={() => handleReportAction(item.id, "reject")}
          >
            <XCircle size={16} color="#EF4444" />
            <Text className="text-red-400 ml-1">Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

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
            Content Moderation
          </Text>
          <TouchableOpacity onPress={() => setFilterStatus(null)}>
            <Filter size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2 mb-4">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search reports..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter Buttons */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              className={`mr-2 px-3 py-1 rounded-full ${filterStatus === null ? "bg-purple-600" : "bg-gray-700"}`}
              onPress={() => setFilterStatus(null)}
            >
              <Text className="text-white">All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`mr-2 px-3 py-1 rounded-full ${filterStatus === "pending" ? "bg-yellow-600" : "bg-gray-700"}`}
              onPress={() => setFilterStatus("pending")}
            >
              <Text className="text-white">Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`mr-2 px-3 py-1 rounded-full ${filterStatus === "approved" ? "bg-green-600" : "bg-gray-700"}`}
              onPress={() => setFilterStatus("approved")}
            >
              <Text className="text-white">Approved</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${filterStatus === "rejected" ? "bg-red-600" : "bg-gray-700"}`}
              onPress={() => setFilterStatus("rejected")}
            >
              <Text className="text-white">Rejected</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-gray-400 mt-4">Loading reports...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Shield size={48} color="#4B5563" />
                <Text className="text-gray-400 text-lg mt-4">
                  {searchQuery || filterStatus
                    ? "No reports match your filters"
                    : "No reports to moderate"}
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-8">
                  When users report content, it will appear here for review
                </Text>
              </View>
            }
          />
        )}

        {/* Report Detail Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className="w-[90%] bg-gray-900 rounded-xl p-4 max-h-[80%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">
                  Report Details
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {selectedReport && (
                <ScrollView className="flex-1">
                  {/* Content Info */}
                  <View className="mb-4">
                    <Text className="text-gray-400 mb-1">Content</Text>
                    <View className="bg-gray-800 rounded-lg p-3">
                      <View className="flex-row items-center">
                        {getContentTypeIcon(selectedReport.content_type)}
                        <Text className="text-white font-semibold ml-2">
                          {selectedReport.title ||
                            `${selectedReport.content_type} #${selectedReport.content_id}`}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs mt-2">
                        Content ID: {selectedReport.content_id}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Type: {selectedReport.content_type}
                      </Text>
                    </View>
                  </View>

                  {/* Report Info */}
                  <View className="mb-4">
                    <Text className="text-gray-400 mb-1">
                      Report Information
                    </Text>
                    <View className="bg-gray-800 rounded-lg p-3">
                      <Text className="text-white">Reason for Report:</Text>
                      <Text className="text-gray-300 mt-1">
                        {selectedReport.reason}
                      </Text>
                      <View className="mt-3 pt-3 border-t border-gray-700">
                        <Text className="text-gray-400 text-xs">
                          Reported by: {selectedReport.reporter_name}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          Date:{" "}
                          {new Date(
                            selectedReport.reported_at,
                          ).toLocaleString()}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-gray-400 text-xs">
                            Status:{" "}
                          </Text>
                          <View
                            className={`rounded-full px-2 py-0.5 ml-1 ${getStatusColor(selectedReport.status).split(" ")[0]}`}
                          >
                            <Text
                              className={`text-xs ${getStatusColor(selectedReport.status).split(" ")[1]}`}
                            >
                              {selectedReport.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Admin Notes */}
                  {selectedReport.status === "pending" && (
                    <View className="mb-4">
                      <Text className="text-gray-400 mb-1">Admin Notes</Text>
                      <TextInput
                        className="bg-gray-800 text-white p-3 rounded-lg"
                        placeholder="Add notes about this report..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={adminNote}
                        onChangeText={setAdminNote}
                      />
                    </View>
                  )}

                  {/* Action Buttons */}
                  {selectedReport.status === "pending" && (
                    <View className="flex-row justify-between mt-4">
                      <TouchableOpacity
                        className="bg-red-600/30 rounded-lg flex-1 py-3 mr-2 items-center"
                        onPress={() =>
                          handleReportAction(selectedReport.id, "reject")
                        }
                      >
                        <Text className="text-red-400 font-semibold">
                          Reject Report
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-green-600/30 rounded-lg flex-1 py-3 ml-2 items-center"
                        onPress={() =>
                          handleReportAction(selectedReport.id, "approve")
                        }
                      >
                        <Text className="text-green-400 font-semibold">
                          Approve Report
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* View Content Button */}
                  <TouchableOpacity
                    className="bg-blue-600 rounded-lg py-3 items-center mt-4"
                    onPress={() => {
                      setModalVisible(false);
                      // Navigate to content based on type
                      if (selectedReport.content_type === "anime") {
                        router.push(
                          `/watch?animeId=${selectedReport.content_id}`,
                        );
                      } else if (selectedReport.content_type === "user") {
                        router.push(
                          `/admin/users?highlight=${selectedReport.content_id}`,
                        );
                      } else {
                        Alert.alert(
                          "View Content",
                          "This would navigate to the specific content in a real app.",
                        );
                      }
                    }}
                  >
                    <View className="flex-row items-center">
                      <Eye size={18} color="#FFFFFF" />
                      <Text className="text-white font-bold ml-2">
                        View Content
                      </Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// Import the missing components
import { Film, User } from "lucide-react-native";
