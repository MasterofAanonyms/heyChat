import { useAppTheme } from "@/context/app-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true); // true = Active (status_id 1)

  async function loadUser() {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setFirstName(user.fname ?? "");
        setLastName(user.lname ?? "");
        setMobile(user.mobile ?? "");
        setProfileImg(user.img_url ?? null);
        setIsAvailable(user.status_id === 1); // 1 = Active, 2 = Inactive
      }
    } catch (err) {
      console.error(err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  async function toggleAvailability() {
    const newStatus = !isAvailable;
    const newStatusId = newStatus ? 1 : 2; // 1 = Active, 2 = Inactive

    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) return;

      const user = JSON.parse(userString);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/update-status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: user.mobile, status_id: newStatusId }),
        }
      );

      const text = await response.text();
      const data = JSON.parse(text);

      if (data.status === "success") {
        setIsAvailable(newStatus);

        user.status_id = newStatusId;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      } else {
        Alert.alert("Error", data.message ?? "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  }

  function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          router.replace("../index.tsx");
        },
      },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.title }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Manage your account and app preferences
          </Text>
        </View>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: isDarkMode ? "#1E293B" : "#E0E7FF" },
            ]}
          >
            {profileImg ? (
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${profileImg}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                {initials}
              </Text>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {firstName} {lastName}
            </Text>
            <Text style={[styles.phone, { color: colors.muted }]}>
              {mobile}
            </Text>
          </View>

          <Pressable
            style={styles.editButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subtitle }]}>
          Account
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="person-outline"
            label="Profile"
            value="Name, photo, status"
            colors={colors}
            onPress={() => router.push("/(tabs)/profile")}
          />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="radio-button-on-outline"
            label="Availability"
            value={isAvailable ? "Active mode" : "Inactive mode"}
            colors={colors}
            onPress={toggleAvailability}
            rightLabel={isAvailable ? "Active" : "Inactive"}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subtitle }]}>
          App
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="chatbubble-outline"
            label="Chats"
            value={isDarkMode ? "Dark mode" : "Light mode"}
            colors={colors}
            onPress={toggleTheme}
            rightLabel={isDarkMode ? "Dark" : "Light"}
          />
          <SettingRow
            icon="help-circle-outline"
            label="Help"
            value="Support and feedback"
            colors={colors}
            onPress={() => Linking.openURL("https://google.com")}
          />
        </View>

        <Pressable
          style={[
            styles.logoutCard,
            {
              backgroundColor: colors.card,
              borderColor: isDarkMode ? "#7F1D1D" : "#FECACA",
            },
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  rightLabel,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  rightLabel?: string;
  onPress?: () => void;
  colors: {
    card: string;
    border: string;
    text: string;
    muted: string;
    rowBg: string;
    rowIconBg: string;
    rowIcon: string;
    chevron: string;
    divider: string;
  };
}) {
  return (
    <Pressable
      style={[
        styles.row,
        { backgroundColor: colors.rowBg, borderBottomColor: colors.divider },
      ]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <View
          style={[styles.rowIconWrap, { backgroundColor: colors.rowIconBg }]}
        >
          <Ionicons name={icon} size={18} color={colors.rowIcon} />
        </View>
        <View>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.rowValue, { color: colors.muted }]}>
            {value}
          </Text>
        </View>
      </View>

      {rightLabel ? (
        <Text style={[styles.rightLabel, { color: colors.muted }]}>
          {rightLabel}
        </Text>
      ) : (
        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color={colors.chevron}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { marginTop: 4, fontSize: 14 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: { width: 56, height: 56 },
  avatarText: { fontSize: 16, fontWeight: "800" },
  profileInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700" },
  phone: { marginTop: 4, fontSize: 13 },
  editButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden", marginBottom: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: "700" },
  rowValue: { marginTop: 2, fontSize: 12 },
  rightLabel: { fontSize: 13, fontWeight: "600" },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },
});