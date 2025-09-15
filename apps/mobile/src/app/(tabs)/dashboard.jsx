import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  X,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Complete appointment mutation
  const completeMutation = useMutation({
    mutationFn: async (bookingId) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!response.ok) {
        throw new Error("Failed to complete appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboard"]);
      Alert.alert(
        "Appointment Completed",
        "The appointment has been marked as completed.",
      );
    },
    onError: () => {
      Alert.alert("Error", "Failed to complete appointment. Please try again.");
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 0);
  };

  const handleCompleteAppointment = (appointment) => {
    Alert.alert(
      "Complete Appointment",
      `Mark ${appointment.service_name} appointment as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => completeMutation.mutate(appointment.id),
        },
      ],
    );
  };

  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const renderStatCard = (title, value, Icon, color) => (
    <View
      style={{
        backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
        borderRadius: 16,
        padding: 20,
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: isDark ? "#3A3A3A" : "#E8DCC0",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <View
          style={{
            backgroundColor: color + "20",
            padding: 8,
            borderRadius: 8,
            marginRight: 12,
          }}
        >
          <Icon size={20} color={color} />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: isDark ? "#9CA3AF" : "#8B7355",
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Inter_600SemiBold",
          color: isDark ? "#FFFFFF" : "#5D4E37",
        }}
      >
        {value}
      </Text>
    </View>
  );

  const renderAppointmentCard = (appointment) => (
    <View
      key={appointment.id}
      style={{
        backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? "#3A3A3A" : "#E8DCC0",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#5D4E37",
              marginBottom: 4,
            }}
          >
            {appointment.service_name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#8B7355",
            }}
          >
            Client ID: {appointment.user_id}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleCompleteAppointment(appointment)}
          style={{
            backgroundColor: "#22C55E",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <CheckCircle size={14} color="#FFFFFF" />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_500Medium",
              color: "#FFFFFF",
              marginLeft: 4,
            }}
          >
            Complete
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Clock size={16} color={isDark ? "#9CA3AF" : "#8B7355"} />
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: isDark ? "#9CA3AF" : "#8B7355",
            marginLeft: 8,
          }}
        >
          {formatTime(appointment.start_time)} ({appointment.duration_minutes}{" "}
          min)
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#9CA3AF" : "#8B7355",
          }}
        >
          Service Price
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#C8A882",
          }}
        >
          ${parseFloat(appointment.price).toFixed(2)}
        </Text>
      </View>

      {appointment.notes && (
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#3A3A3A" : "#E8DCC0",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#8B7355",
            }}
          >
            Notes: {appointment.notes}
          </Text>
        </View>
      )}
    </View>
  );

  const stats = dashboardData?.weeklyStats || {};
  const todayAppointments = dashboardData?.todayAppointments || [];
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FDF8F0" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: isDark ? "#121212" : "#FDF8F0",
          borderBottomWidth: showHeaderBorder ? 1 : 0,
          borderBottomColor: isDark ? "#333333" : "#E8DCC0",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#5D4E37",
          }}
        >
          Employee Dashboard
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#9CA3AF" : "#8B7355",
            marginTop: 4,
          }}
        >
          Welcome back! Here's today's overview
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 24,
            marginHorizontal: -4,
          }}
        >
          {renderStatCard(
            "This Week's Bookings",
            stats.total_bookings || "0",
            Calendar,
            "#C8A882",
          )}
          {renderStatCard(
            "Revenue",
            `$${parseFloat(stats.total_revenue || 0).toFixed(0)}`,
            DollarSign,
            "#22C55E",
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 24,
            marginHorizontal: -4,
          }}
        >
          {renderStatCard(
            "Customers",
            stats.unique_customers || "0",
            Users,
            "#3B82F6",
          )}
          {renderStatCard(
            "Today's Appts",
            todayAppointments.length.toString(),
            Clock,
            "#F59E0B",
          )}
        </View>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#5D4E37",
                marginBottom: 16,
              }}
            >
              Today's Appointments
            </Text>
            {todayAppointments.map(renderAppointmentCard)}
          </View>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#5D4E37",
                marginBottom: 16,
              }}
            >
              Upcoming Appointments
            </Text>
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <View
                key={appointment.id}
                style={{
                  backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#3A3A3A" : "#E8DCC0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                        marginBottom: 4,
                      }}
                    >
                      {appointment.service_name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#9CA3AF" : "#8B7355",
                      }}
                    >
                      {formatDate(appointment.booking_date)} at{" "}
                      {formatTime(appointment.start_time)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#C8A882",
                    }}
                  >
                    ${parseFloat(appointment.price).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {isLoading && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#8B7355",
              }}
            >
              Loading dashboard...
            </Text>
          </View>
        )}

        {!isLoading &&
          todayAppointments.length === 0 &&
          upcomingAppointments.length === 0 && (
            <View
              style={{
                backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "#3A3A3A" : "#E8DCC0",
              }}
            >
              <Calendar
                size={32}
                color="#C8A882"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#5D4E37",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                No Appointments Today
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#8B7355",
                  textAlign: "center",
                }}
              >
                Enjoy your free time!
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}
