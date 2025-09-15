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
import { 
  Play, 
  Star, 
  Gift, 
  Package,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return response.json();
    },
  });

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

  // Sample data for demonstrations
  const serviceGallery = [
    { id: 1, title: "Perfect Manicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=200&fit=crop" },
    { id: 2, title: "Hair Styling", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=200&fit=crop" },
    { id: 3, title: "Facial Treatment", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=300&h=200&fit=crop" },
  ];

  const promotions = [
    {
      id: 1,
      title: "New Client Special",
      description: "20% off your first appointment",
      discount: "20%",
      validUntil: "Dec 31, 2024"
    },
    {
      id: 2,
      title: "Referral Bonus",
      description: "Bring a friend and both get 15% off",
      discount: "15%",
      validUntil: "Ongoing"
    }
  ];

  const serviceBundles = [
    {
      id: 1,
      title: "Mani + Pedi Combo",
      description: "Manicure + Pedicure together",
      originalPrice: 65,
      bundlePrice: 60,
      discount: "5% cheaper",
      services: ["Manicure", "Pedicure"]
    },
    {
      id: 2,
      title: "Spa Day Package",
      description: "Facial + Hair Treatment + Massage",
      originalPrice: 180,
      bundlePrice: 160,
      discount: "11% cheaper",
      services: ["Facial", "Hair Treatment", "Massage"]
    }
  ];

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      onPress={() => handleServiceSelect(service)}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#F4E6D7",
        width: 280,
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
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#5D4E37",
            marginBottom: 4,
          }}
        >
          {service.name}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Inter_400Regular",
            color: "#8B7355",
            lineHeight: 18,
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
          <Clock size={14} color="#8B7355" />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_500Medium",
              color: "#8B7355",
              marginLeft: 4,
            }}
          >
            {service.duration_minutes} min
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DollarSign size={14} color="#E91E63" />
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Inter_600SemiBold",
              color: "#E91E63",
            }}
          >
            {parseFloat(service.price).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGalleryItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={{
        marginRight: 12,
        borderRadius: 12,
        overflow: "hidden",
        width: 160,
        height: 120,
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          width: "100%",
          height: "100%",
        }}
        contentFit="cover"
        transition={200}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: 8,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 12,
            fontFamily: "Inter_500Medium",
          }}
        >
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPromotion = (promo) => (
    <View
      key={promo.id}
      style={{
        backgroundColor: "#FCE4EC",
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#F8BBD9",
        width: 240,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Gift size={16} color="#E91E63" />
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#E91E63",
            marginLeft: 6,
          }}
        >
          {promo.discount}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 15,
          fontFamily: "Inter_600SemiBold",
          color: "#5D4E37",
          marginBottom: 4,
        }}
      >
        {promo.title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          color: "#8B7355",
          marginBottom: 8,
        }}
      >
        {promo.description}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Inter_400Regular",
          color: "#B8A082",
        }}
      >
        Valid until {promo.validUntil}
      </Text>
    </View>
  );

  const renderBundle = (bundle) => (
    <TouchableOpacity
      key={bundle.id}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#F4E6D7",
        width: 260,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Package size={16} color="#E91E63" />
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_600SemiBold",
            color: "#E91E63",
            marginLeft: 6,
          }}
        >
          {bundle.discount}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 15,
          fontFamily: "Inter_600SemiBold",
          color: "#5D4E37",
          marginBottom: 4,
        }}
      >
        {bundle.title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          color: "#8B7355",
          marginBottom: 12,
        }}
      >
        {bundle.description}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#8B7355",
              textDecorationLine: "line-through",
            }}
          >
            ${bundle.originalPrice}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#E91E63",
            }}
          >
            ${bundle.bundlePrice}
          </Text>
        </View>
        <ArrowRight size={16} color="#E91E63" />
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
            fontFamily: "Inter_700Bold",
            color: "#5D4E37",
          }}
        >
          Welcome to Bella Beauty
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#8B7355",
            marginTop: 4,
          }}
        >
          Your beauty journey starts here
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Featured Video Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              height: 180,
              borderWidth: 1,
              borderColor: "#F4E6D7",
            }}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=200&fit=crop" }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#E91E63",
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Play size={24} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  marginTop: 12,
                }}
              >
                Watch Our Services
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* New Services Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Sparkles size={20} color="#E91E63" />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: "#5D4E37",
                  marginLeft: 8,
                }}
              >
                New Services
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 16,
                    marginRight: 12,
                    width: 280,
                    height: 100,
                  }}
                />
              ))
            ) : servicesData?.services?.length > 0 ? (
              servicesData.services.slice(0, 5).map(renderServiceCard)
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#8B7355",
                  fontStyle: "italic",
                }}
              >
                No services available
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Service Gallery */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: "#5D4E37",
              }}
            >
              Our Work
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#8B7355",
                marginTop: 2,
              }}
            >
              See what we've created
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {serviceGallery.map(renderGalleryItem)}
          </ScrollView>
        </View>

        {/* Promotions */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Gift size={20} color="#E91E63" />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: "#5D4E37",
                  marginLeft: 8,
                }}
              >
                Special Offers
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {promotions.map(renderPromotion)}
          </ScrollView>
        </View>

        {/* Service Bundles */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Package size={20} color="#E91E63" />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: "#5D4E37",
                  marginLeft: 8,
                }}
              >
                Service Bundles
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#8B7355",
                marginTop: 2,
              }}
            >
              Save more with combo packages
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {serviceBundles.map(renderBundle)}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}