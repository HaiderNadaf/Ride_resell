import { useEffect } from "react";
import { Text, View } from "react-native";
import { Tabs } from "expo-router";
import { CirclePlus, House, Search, UserRound } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { registerForPushToken } from "../../utils/registerPush";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await registerForPushToken();

        if (!mounted || !token) return;

        const baseUrl =
          process.env.EXPO_PUBLIC_BASE_URL ||
          "https://ride-rel-backend.onrender.com";
        const response = await fetch(`${baseUrl}/api/save-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok && mounted) {
          console.warn("Failed to save push token:", response.status);
        }
      } catch (error) {
        if (mounted) {
          console.error("Push token registration failed:", error);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: Math.max(insets.bottom, 10),
            height: 64 + Math.max(insets.bottom, 8),
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem label="Home" focused={focused} icon={House} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem label="Search" focused={focused} icon={Search} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem label="Create" focused={focused} icon={CirclePlus} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem label="Profile" focused={focused} icon={UserRound} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabItem({
  icon: Icon,
  label,
  focused,
}: {
  icon: any;
  label: string;
  focused: boolean;
}) {
  const color = focused ? "#2F64FF" : "#98A2B3";

  return (
    <View style={styles.item}>
      <Icon size={22} color={color} />
      <Text numberOfLines={1} style={[styles.label, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = {
  tabBar: {
    position: "absolute" as const,
    left: 14,
    right: 14,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    paddingTop: 10,
  },
  item: {
    width: 64,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800" as const,
    lineHeight: 12,
    textAlign: "center" as const,
    flexShrink: 0,
  },
};
