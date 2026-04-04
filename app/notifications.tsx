import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, ChevronRight } from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";
import {
  fetchNotifications,
  markNotificationRead,
  AppNotification,
} from "../lib/marketplace";

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchNotifications()
      .then((data) => {
        if (mounted) setItems(data);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = useMemo(() => {
    if (!user?.id) return items.length;
    return items.filter((item) => !(item.readBy || []).includes(user.id))
      .length;
  }, [items, user?.id]);

  const handleOpen = async (item: AppNotification) => {
    if (user?.id) {
      await markNotificationRead(item._id, user.id);
      setItems((current) =>
        current.map((entry) =>
          entry._id === item._id
            ? {
                ...entry,
                readBy: Array.from(new Set([...(entry.readBy || []), user.id])),
              }
            : entry,
        ),
      );
    }

    if (item.productId) {
      router.push(`/details/${item.productId}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <Bell size={20} color="#2F64FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>{unreadCount} unread updates</Text>
            </View>
          </View>
        </View>

        {items.length ? (
          <View style={styles.list}>
            {items.map((item) => {
              const unread = !(item.readBy || []).includes(user?.id || "");
              return (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => handleOpen(item)}
                  activeOpacity={0.85}
                  style={[styles.card, unread && styles.cardUnread]}
                >
                  {item.productImage ? (
                    <Image
                      source={{ uri: item.productImage }}
                      style={styles.thumb}
                      onError={(error) => {
                        console.warn(
                          "Failed to load notification image:",
                          item.productImage,
                          error,
                        );
                      }}
                    />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Bell size={18} color="#98A2B3" />
                    </View>
                  )}
                  <View style={styles.body}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {new Date(item.createdAt || Date.now()).toLocaleString()}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#98A2B3" />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              New listings will appear here and also push to devices that
              allowed notifications.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  screen: { flex: 1, backgroundColor: "#F6F7FB" as const },
  content: { paddingBottom: 120 },
  center: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EAF1FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: { fontSize: 20, fontWeight: "900" as const, color: "#101828" },
  subtitle: { marginTop: 3, color: "#667085", fontSize: 12 },
  list: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    shadowColor: "#101828",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: "#C7D7FE",
    backgroundColor: "#F8FAFF",
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#EEF2F6",
  },
  thumbFallback: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#EEF2F6",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  body: {
    flex: 1,
    paddingTop: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "900" as const, color: "#101828" },
  cardBody: { marginTop: 4, color: "#667085", fontSize: 13, lineHeight: 18 },
  cardMeta: { marginTop: 6, color: "#98A2B3", fontSize: 11 },
  empty: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center" as const,
  },
  emptyTitle: { fontSize: 16, fontWeight: "900" as const, color: "#101828" },
  emptyText: {
    marginTop: 8,
    color: "#667085",
    textAlign: "center" as const,
    lineHeight: 20,
  },
};
