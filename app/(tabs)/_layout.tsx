// import { Tabs } from "expo-router";
// import { House, Newspaper, User } from "lucide-react-native";

// export default function TabLayout() {
//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color }) => <House color={color} size={24} />,
//         }}
//       />

//       <Tabs.Screen
//         name="feed"
//         options={{
//           title: "Feed",
//           tabBarIcon: ({ color }) => <Newspaper color={color} size={24} />,
//         }}
//       />

//       <Tabs.Screen
//         name="create"
//         options={{
//           title: "create",
//           tabBarIcon: ({ color }) => <Newspaper color={color} size={24} />,
//         }}
//       />

//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color }) => <User color={color} size={24} />,
//         }}
//       />
//     </Tabs>
//   );
// // }

// import { Tabs } from "expo-router";
// import { House, Newspaper, User } from "lucide-react-native";
// import { useEffect } from "react";
// import { registerForPushToken } from "../../utils/registerPush";

// export default function TabLayout() {
//   useEffect(() => {
//     async function init() {
//       const token = await registerForPushToken();

//       if (token) {
//         await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/save-token`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ token }),
//         });
//       }
//     }
//     init();
//   }, []);

//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home", // Sets the tab label to "Home"
//           tabBarIcon: ({ color }) => <House color={color} size={24} />,
//         }}
//       />
//       <Tabs.Screen
//         name="feed"
//         options={{
//           title: "Feed",
//           tabBarIcon: ({ color }) => <Newspaper color={color} size={24} />,
//         }}
//       />
//       <Tabs.Screen
//         name="create"
//         options={{
//           title: "create", // Keeps lowercase if you want it exact
//           tabBarIcon: ({ color }) => <Newspaper color={color} size={24} />, // Or choose a better icon for "create" if desired
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color }) => <User color={color} size={24} />,
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from "expo-router";
import { House, Newspaper, User } from "lucide-react-native";
import { View, Text } from "react-native";
import { useEffect } from "react";
import { registerForPushToken } from "../../utils/registerPush";

export default function TabLayout() {
  useEffect(() => {
    async function init() {
      const token = await registerForPushToken();

      if (token) {
        await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/save-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      }
    }
    init();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 18,
          left: 16,
          right: 16,
          height: 72,
          borderRadius: 40,
          backgroundColor: "#fff",
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
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
            <TabItem label="Feed" focused={focused} icon={Newspaper} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem label="Create" focused={focused} icon={Newspaper} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem label="Profile" focused={focused} icon={User} />
          ),
        }}
      />
    </Tabs>
  );
}

/* ---------- Tab Item UI ---------- */

function TabItem({
  icon: Icon,
  label,
  focused,
}: {
  icon: any;
  label: string;
  focused: boolean;
}) {
  const color = focused ? "#F59E0B" : "#9CA3AF";

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 16,
      }}
    >
      <Icon size={22} color={color} />

      <Text
        style={{
          marginTop: 11,
          fontSize: 12,
          fontWeight: "600",
          color,
          lineHeight: 14,
          includeFontPadding: false, // ✅ Fixes Android top padding
          textAlignVertical: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
