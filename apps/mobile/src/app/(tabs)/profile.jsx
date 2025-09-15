import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Camera,
  User,
  CreditCard,
  Globe,
  Clock,
  UserPlus,
  HelpCircle,
  ChevronRight,
  Settings,
  Calendar,
  RotateCw,
  LogOut,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [profileImage, setProfileImage] = useState(
    "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
  );
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Mock user ID - in a real app this would come from authentication
  const mockUserId = "employee_001";

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability", mockUserId],
    queryFn: async () => {
      const response = await fetch(`/api/availability?user_id=${mockUserId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      return response.json();
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availability) => {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: mockUserId,
          availability: availability,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update availability");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["availability", mockUserId]);
      Alert.alert("Success", "Availability updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update availability");
      console.error("Update availability error:", error);
    },
  });

  const syncCalendarMutation = useMutation({
    mutationFn: async (availability) => {
      const response = await fetch("/api/google-calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: mockUserId,
          availability: availability,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to sync with Google Calendar");
      }
      return response.json();
    },
    onSuccess: (data) => {
      Alert.alert(
        "Google Calendar Sync", 
        data.message || "Successfully synced with Google Calendar"
      );
    },
    onError: (error) => {
      Alert.alert("Sync Error", "Failed to sync with Google Calendar");
      console.error("Calendar sync error:", error);
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 0);
  };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleAvailabilityChange = (dayIndex, field, value) => {
    if (!availabilityData?.availability) return;

    const updatedAvailability = availabilityData.availability.map((day, index) => {
      if (index === dayIndex) {
        return { ...day, [field]: value };
      }
      return day;
    });

    updateAvailabilityMutation.mutate(updatedAvailability);
  };

  const handleSyncCalendar = () => {
    if (!availabilityData?.availability) return;
    
    Alert.alert(
      "Sync with Google Calendar",
      "This will update your Google Calendar with your availability settings. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sync", 
          onPress: () => syncCalendarMutation.mutate(availabilityData.availability)
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => {
          // Implement logout logic here
          console.log("Logout pressed");
        }},
      ]
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeOptions = [
    "09:00:00", "09:30:00", "10:00:00", "10:30:00", "11:00:00", "11:30:00",
    "12:00:00", "12:30:00", "13:00:00", "13:30:00", "14:00:00", "14:30:00",
    "15:00:00", "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00",
    "18:00:00", "18:30:00", "19:00:00", "19:30:00", "20:00:00"
  ];

  const showTimePickerForDay = (dayIndex, isStartTime) => {
    if (!availabilityData?.availability) return;

    const day = availabilityData.availability[dayIndex];
    const currentTime = isStartTime ? day.start_time : day.end_time;

    Alert.alert(
      `Select ${isStartTime ? "Start" : "End"} Time`,
      `${daysOfWeek[dayIndex]}`,
      timeOptions.map(time => ({
        text: formatTime(time),
        onPress: () => handleAvailabilityChange(
          dayIndex, 
          isStartTime ? "start_time" : "end_time", 
          time
        )
      })).concat([{ text: "Cancel", style: "cancel" }])
    );
  };

  const actionItems = [
    {
      icon: Settings,
      label: "Employee Dashboard",
      onPress: () => router.push("/(tabs)/dashboard"),
      highlight: true,
    },
    {
      icon: User,
      label: "Edit Profile",
      onPress: () => router.push("/edit-profile"),
    },
    {
      icon: CreditCard,
      label: "Payment Method",
      onPress: () => console.log("Payment Method"),
    },
    { icon: Globe, label: "Language", onPress: () => console.log("Language") },
    {
      icon: Clock,
      label: "Booking History",
      onPress: () => router.push("/(tabs)/bookings"),
    },
    {
      icon: UserPlus,
      label: "Invite Friends",
      onPress: () => console.log("Invite Friends"),
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      onPress: () => console.log("Help Center"),
    },
  ];

  const renderActionItem = (
    { icon: Icon, label, onPress, highlight },
    index,
  ) => (
    <Pressable
      key={index}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? highlight
            ? "#F8BBD9"
            : "#F4E6D7"
          : highlight
            ? "#FCE4EC"
            : "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: highlight ? "#F8BBD9" : "#F4E6D7",
      })}
    >
      <Icon
        size={24}
        color={highlight ? "#E91E63" : "#8B7355"}
      />
      <Text
        style={{
          marginLeft: 8,
          flex: 1,
          fontSize: 16,
          fontFamily: "Inter_500Medium",
          color: highlight ? "#E91E63" : "#5D4E37",
          fontWeight: highlight ? "600" : "500",
        }}
      >
        {label}
      </Text>
      <ChevronRight
        size={20}
        color={highlight ? "#E91E63" : "#8B7355"}
      />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />

      {/* Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#FDF8F0", // beige background
        }}
      />

      {/* Fixed Header */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "rgba(253, 248, 240, 0.95)", // beige header
          borderBottomWidth: showHeaderBorder ? 1 : 0,
          borderBottomColor: "#F4E6D7",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#5D4E37", // warm brown text
            }}
          >
            Profile
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Block */}
        <View style={{ alignItems: "center", marginBottom: 40, marginTop: 20 }}>
          {/* Avatar with Camera Badge */}
          <View style={{ position: "relative", marginBottom: 16 }}>
            <Image
              source={{ uri: profileImage }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
              }}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={handleImagePicker}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#E91E63", // pink accent
                borderWidth: 2,
                borderColor: "#FDF8F0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Camera size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Name & Email */}
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_600SemiBold",
              color: "#5D4E37",
              marginBottom: 4,
            }}
          >
            Sarah Williams
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: "#8B7355",
              lineHeight: 20,
            }}
          >
            sarah@bellabeauty.com
          </Text>
        </View>

        {/* Availability Settings */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#F4E6D7",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Calendar size={20} color="#E91E63" />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#5D4E37",
                marginLeft: 8,
              }}
            >
              Weekly Availability
            </Text>
          </View>

          {availabilityLoading ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#8B7355",
                textAlign: "center",
                padding: 20,
              }}
            >
              Loading availability...
            </Text>
          ) : (
            <>
              {availabilityData?.availability?.map((day, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottomWidth: index < 6 ? 1 : 0,
                    borderBottomColor: "#F4E6D7",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_500Medium",
                        color: "#5D4E37",
                        flex: 1,
                      }}
                    >
                      {daysOfWeek[day.day_of_week]}
                    </Text>
                    <Switch
                      value={day.is_available}
                      onValueChange={(value) => handleAvailabilityChange(index, "is_available", value)}
                      trackColor={{ false: "#F4E6D7", true: "#F8BBD9" }}
                      thumbColor={day.is_available ? "#E91E63" : "#B8A082"}
                    />
                  </View>

                  {day.is_available && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => showTimePickerForDay(index, true)}
                        style={{
                          flex: 1,
                          backgroundColor: "#FDF8F0",
                          borderRadius: 8,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: "#F4E6D7",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Inter_400Regular",
                            color: "#8B7355",
                            marginBottom: 2,
                          }}
                        >
                          Start Time
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Inter_500Medium",
                            color: "#5D4E37",
                          }}
                        >
                          {formatTime(day.start_time) || "Select"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => showTimePickerForDay(index, false)}
                        style={{
                          flex: 1,
                          backgroundColor: "#FDF8F0",
                          borderRadius: 8,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: "#F4E6D7",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Inter_400Regular",
                            color: "#8B7355",
                            marginBottom: 2,
                          }}
                        >
                          End Time
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Inter_500Medium",
                            color: "#5D4E37",
                          }}
                        >
                          {formatTime(day.end_time) || "Select"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {/* Google Calendar Sync Button */}
              <TouchableOpacity
                onPress={handleSyncCalendar}
                disabled={syncCalendarMutation.isPending}
                style={{
                  backgroundColor: "#E91E63",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 8,
                  opacity: syncCalendarMutation.isPending ? 0.7 : 1,
                }}
              >
                <RotateCw size={18} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#FFFFFF",
                    marginLeft: 8,
                  }}
                >
                  {syncCalendarMutation.isPending ? "Syncing..." : "Sync with Google Calendar"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Action List */}
        <View style={{ marginBottom: 20 }}>
          {actionItems.map((item, index) => renderActionItem(item, index))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#F4E6D7",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <LogOut size={20} color="#E91E63" />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#E91E63",
              marginLeft: 8,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}