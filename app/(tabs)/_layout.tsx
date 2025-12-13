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
// }
import { Tabs } from "expo-router";
import { House, Newspaper, User } from "lucide-react-native";
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
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
