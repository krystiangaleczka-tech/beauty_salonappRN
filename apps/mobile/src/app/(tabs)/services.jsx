import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Clock, DollarSign, Scissors } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { BASE_URL } from "../../config";

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  console.log("Component rendered, BASE_URL:", BASE_URL);
  console.log("Selected category:", selectedCategory);

  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ["services", selectedCategory],
    queryFn: async () => {
      console.log("QueryFn started");
      try {
        const url = selectedCategory === "All" 
          ? `${BASE_URL}/api/services` 
          : `${BASE_URL}/api/services?category=${encodeURIComponent(selectedCategory)}`;
        console.log("Fetching from URL:", url);
        console.log("BASE_URL:", BASE_URL);
        
        const response = await fetch(url);
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error text:", errorText);
          throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Services data received:", data);
        console.log("Services count:", data?.services?.length || 0);
        return data;
      } catch (fetchError) {
        console.error("Fetch error details:", fetchError);
        console.error("Error message:", fetchError.message);
        console.error("Error stack:", fetchError.stack);
        throw fetchError;
      }
    },
    retry: false,
  });

  if (error) {
    console.error("Query error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }

  // Extract unique categories and add "All" as first option
  const categories = useMemo(() => {
    if (!servicesData?.services) return ["All"];
    const uniqueCategories = [...new Set(servicesData.services.map(service => service.category))];
    return ["All", ...uniqueCategories.sort()];
  }, [servicesData]);

  // Services are now filtered server-side, no need for client-side filtering

  if (!fontsLoaded) {
    return null;
  }

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 0);
  };

  const handleServiceSelect = (service) => {
    router.push(
      `/book-service?service_id=${service.id}&service_name=${encodeURIComponent(service.name)}`,
    );
  };

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      onPress={() => handleServiceSelect(service)}
      style={{
        backgroundColor: "#FFFFFF", // white background
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F4E6D7", // light beige border
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.8}
    >
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#5D4E37", // warm brown text
            marginBottom: 6,
          }}
        >
          {service.name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#8B7355", // muted brown
            lineHeight: 20,
          }}
        >
          {service.description}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Clock size={16} color="#8B7355" />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#8B7355",
              marginLeft: 6,
            }}
          >
            {service.duration_minutes} min
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DollarSign size={16} color="#E91E63" />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#E91E63", // pink accent
            }}
          >
            {parseFloat(service.price).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          Our Services
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#8B7355",
            marginTop: 4,
          }}
        >
          Book your beauty appointment
        </Text>
      </View>

      {/* Category Filter */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor: selectedCategory === category ? "#E91E63" : "#FFFFFF",
                borderWidth: 1,
                borderColor: selectedCategory === category ? "#E91E63" : "#F4E6D7",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: selectedCategory === category ? "#FFFFFF" : "#5D4E37",
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        ) : servicesData?.services?.length > 0 ? (
          servicesData.services.map(renderServiceCard)
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
              <Scissors size={32} color="#E91E63" />
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
              No Services Available
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
              Services will appear here once they are added
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
