// import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from "@/context/app-theme";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => {
            return (
              <Ionicons name="chatbubbles-sharp" size={size} color={color} />
            );
          },
        }}
      />

      <Tabs.Screen name="profile" options={{
                tabBarLabel: "Profile",
                tabBarIcon: ({ color, size }) => {
                    return (
                        <FontAwesome name="user-circle-o" size={size} color={color} />
                    );
                }
            }} />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="settings" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
