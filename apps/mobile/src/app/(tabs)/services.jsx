import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Clock, DollarSign, Scissors, Search, X, WifiOff, AlertCircle } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BASE_URL } from "../../config";

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      console.log("=== QUERY START ===");
      console.log("Selected category:", selectedCategory);
      console.log("BASE_URL:", BASE_URL);
      console.log("Window hostname:", typeof window !== 'undefined' ? window.location.hostname : 'undefined');
      
      try {
        const url = selectedCategory === "All" 
          ? `${BASE_URL}/api/services` 
          : `${BASE_URL}/api/services?category=${encodeURIComponent(selectedCategory)}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error text:", errorText);
          throw new Error(`Failed to fetch services: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Services data received:", data);
        console.log("Services count:", data?.services?.length || 0);
        console.log("=== QUERY SUCCESS ===");
        return data;
      } catch (fetchError) {
        console.error("=== QUERY ERROR ===");
        console.error("Error name:", fetchError?.name);
        console.error("Error message:", fetchError?.message);
        console.error("Error stack:", fetchError?.stack);
        console.error("=== QUERY ERROR END ===");
        throw fetchError;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Extract unique categories and add "All" as first option
  const categories = useMemo(() => {
    if (!servicesData?.services) return ["All"];
    const uniqueCategories = [...new Set(servicesData.services.map(service => service.category))];
    return ["All", ...uniqueCategories.sort()];
  }, [servicesData]);

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!servicesData?.services) return [];
    if (!searchQuery.trim()) return servicesData.services;
    
    const query = searchQuery.toLowerCase().trim();
    return servicesData.services.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
  }, [servicesData, searchQuery]);

  if (!fontsLoaded) {
    return null;
  }

  const renderServiceCard = (service, index) => {
    return (
      <View
        key={service.id}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#F4E6D7",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.push(
              `/book-service?service_id=${service.id}&service_name=${encodeURIComponent(service.name)}`,
            );
          }}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
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
              <View
                style={{
                  backgroundColor: "#F4E6D7",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  alignSelf: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#8B7355",
                  }}
                >
                  {service.category}
                </Text>
              </View>
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
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#F4E6D7",
              paddingTop: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#FDF8F0",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Clock size={16} color="#8B7355" />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#8B7355",
                }}
              >
                {service.duration_minutes} min
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#FDF8F0",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <DollarSign size={16} color="#E91E63" />
              </View>
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
      </View>
    );
  };

  const keyExtractor = (item) => `service-${item.id}`;

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 0);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

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

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isSearchFocused ? "#E91E63" : "#F4E6D7",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Search size={20} color={isSearchFocused ? "#E91E63" : "#8B7355"} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: "#5D4E37",
              marginLeft: 12,
              padding: 0,
            }}
            placeholder="Search services..."
            placeholderTextColor="#8B7355"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#8B7355" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategorySelect(category)}
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
      <View style={{ flex: 1 }}>
        {isLoading ? (
          // Loading skeleton
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            {Array.from({ length: 3 }).map((_, index) => (
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
            ))}
          </View>
        ) : error ? (
          // Error state
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
            showsVerticalScrollIndicator={false}
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
              <AlertCircle size={32} color="#E91E63" />
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
              Error Loading Services
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#8B7355",
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 40,
                marginBottom: 24,
              }}
            >
              An error occurred while loading services. Please try again later.
            </Text>
          </ScrollView>
        ) : filteredServices.length > 0 ? (
          <FlatList
            data={filteredServices}
            renderItem={({ item, index }) => renderServiceCard(item, index)}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 20,
              paddingTop: 16,
            }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />
        ) : (
          // Empty state
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
            showsVerticalScrollIndicator={false}
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
              {searchQuery
                ? "No services match your search. Try a different search term."
                : "Services will appear here once they are added"
              }
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}