import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, Scissors, Calendar, User } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FDF8F0", // beige background
          borderTopWidth: 1,
          borderTopColor: "#F4E6D7", // light beige border
        },
        tabBarActiveTintColor: "#E91E63", // pink accent
        tabBarInactiveTintColor: "#B8A082", // muted beige
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => <Scissors color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null, // Hidden tab for employee dashboard
        }}
      />
    </Tabs>
  );
}
