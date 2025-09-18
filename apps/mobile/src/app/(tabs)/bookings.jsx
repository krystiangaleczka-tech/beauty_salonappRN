import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Calendar, Clock, MapPin, X } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async (bookingId) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"]);
      Alert.alert("Booking Cancelled", "Your appointment has been cancelled.");
    },
    onError: () => {
      Alert.alert("Error", "Failed to cancel booking. Please try again.");
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 0);
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your ${booking.service_name} appointment?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => cancelMutation.mutate(booking.id),
        },
      ],
    );
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#E91E63"; // pink
      case "completed":
        return "#22C55E"; // green
      case "cancelled":
        return "#EF4444"; // red
      default:
        return "#8B7355"; // brown
    }
  };

  const renderBookingCard = (booking) => (
    <View
      key={booking.id}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F4E6D7",
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        elevation: 2,
      }}
    >
      {/* Header with service name and status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#5D4E37",
            flex: 1,
            marginRight: 12,
          }}
        >
          {booking.service_name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: getStatusColor(booking.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginRight: booking.status === "confirmed" ? 8 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#FFFFFF",
                textTransform: "capitalize",
              }}
            >
              {booking.status}
            </Text>
          </View>

          {booking.status === "confirmed" && (
            <TouchableOpacity
              onPress={() => handleCancelBooking(booking)}
              style={{
                padding: 4,
              }}
            >
              <X size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date and time */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Calendar size={16} color="#8B7355" />
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#8B7355",
            marginLeft: 8,
          }}
        >
          {formatDate(booking.booking_date)}
        </Text>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Clock size={16} color="#8B7355" />
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#8B7355",
            marginLeft: 8,
          }}
        >
          {formatTime(booking.start_time)} ({booking.duration_minutes} min)
        </Text>
      </View>

      {/* Price */}
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
            color: "#8B7355",
          }}
        >
          Total
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#E91E63",
          }}
        >
          ${parseFloat(booking.price).toFixed(2)}
        </Text>
      </View>

      {booking.notes && (
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F4E6D7",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#8B7355",
            }}
          >
            Notes: {booking.notes}
          </Text>
        </View>
      )}
    </View>
  );

  // Group bookings by status
  const groupedBookings =
    bookingsData?.bookings?.reduce((groups, booking) => {
      const status = booking.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(booking);
      return groups;
    }, {}) || {};

  // Sort each group by date
  Object.keys(groupedBookings).forEach((status) => {
    groupedBookings[status].sort((a, b) => {
      const dateA = new Date(`${a.booking_date} ${a.start_time}`);
      const dateB = new Date(`${b.booking_date} ${b.start_time}`);
      return dateB - dateA; // Most recent first
    });
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FDF8F0",
          borderBottomWidth: showHeaderBorder ? 1 : 0,
          borderBottomColor: "#F4E6D7",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_600SemiBold",
            color: "#5D4E37",
          }}
        >
          My Bookings
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#8B7355",
            marginTop: 4,
          }}
        >
          Your appointment history
        </Text>
      </View>

      {/* Content */}
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
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                height: 120,
              }}
            />
          ))
        ) : Object.keys(groupedBookings).length > 0 ? (
          <>
            {/* Confirmed bookings first */}
            {groupedBookings.confirmed?.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#5D4E37",
                    marginBottom: 16,
                  }}
                >
                  Upcoming Appointments
                </Text>
                {groupedBookings.confirmed.map(renderBookingCard)}
              </View>
            )}

            {/* Completed bookings */}
            {groupedBookings.completed?.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#5D4E37",
                    marginBottom: 16,
                  }}
                >
                  Completed
                </Text>
                {groupedBookings.completed.map(renderBookingCard)}
              </View>
            )}

            {/* Cancelled bookings */}
            {groupedBookings.cancelled?.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#5D4E37",
                    marginBottom: 16,
                  }}
                >
                  Cancelled
                </Text>
                {groupedBookings.cancelled.map(renderBookingCard)}
              </View>
            )}
          </>
        ) : (
          // Empty state
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#F4E6D7",
              }}
            >
              <Calendar size={32} color="#E91E63" />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: "#5D4E37",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No Bookings Yet
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#8B7355",
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 40,
              }}
            >
              Your appointments will appear here once you book a service
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
