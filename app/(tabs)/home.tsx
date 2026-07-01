import { useAppTheme } from "@/context/app-theme";
import Feather from "@expo/vector-icons/Feather";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { colors } = useAppTheme();

  const truncateMessage = (message: string) =>
    message.length > 25 ? message.slice(0, 25) + "..." : message;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: colors.title }]}>Chats</Text>
        </View>
        <Pressable style={styles.bellButton}>
          <Text style={styles.bellIcon}></Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Feather name="search" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search contacts"
          placeholderTextColor={colors.muted}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContent}
      >
        <Pressable style={styles.contactCard}>
          <View style={styles.avatarWrap}>
            {/* <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View> */}

            <Image
              source={require("../../assets/images/mutanf.png")}
              style={styles.avatar}
            />
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                Ava Johnson
              </Text>
              <Text style={[styles.timeText, { color: colors.muted }]}>
                9:24 AM
              </Text>
            </View>

            <View style={styles.contactRow}>
              <Text
                style={[styles.messageText, { color: colors.muted }]}
                numberOfLines={1}
              >
                {truncateMessage("Are we still on for kghhjkll?")}
              </Text>
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: colors.rowIcon },
                ]}
              >
                <Text style={styles.unreadText}>2</Text>
              </View>
            </View>
          </View>
        </Pressable>

        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

        <Pressable style={styles.contactCard}>
          <View style={styles.avatarWrap}>
            <View
              style={[styles.avatar, { backgroundColor: colors.rowIconBg }]}
            >
              <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                NS
              </Text>
            </View>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                Noah Smith
              </Text>
              <Text style={[styles.timeText, { color: colors.muted }]}>
                8:10 AM
              </Text>
            </View>

            <View style={styles.contactRow}>
              <Text
                style={[styles.messageText, { color: colors.muted }]}
                numberOfLines={1}
              >
                {truncateMessage("Sent the photos just now.")}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

        <Pressable style={styles.contactCard}>
          <View style={styles.avatarWrap}>
            <View
              style={[styles.avatar, { backgroundColor: colors.rowIconBg }]}
            >
              <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                MB
              </Text>
            </View>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                Mia Brown
              </Text>
              <Text style={[styles.timeText, { color: colors.muted }]}>
                Yesterday
              </Text>
            </View>

            <View style={styles.contactRow}>
              <Text
                style={[styles.messageText, { color: colors.muted }]}
                numberOfLines={1}
              >
                {truncateMessage("I'll call you later.")}
              </Text>
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: colors.rowIcon },
                ]}
              >
                <Text style={styles.unreadText}>1</Text>
              </View>
            </View>
          </View>
        </Pressable>

        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

        <Pressable style={styles.contactCard}>
          <View style={styles.avatarWrap}>
            <View
              style={[styles.avatarG, { backgroundColor: colors.rowIconBg }]}
            >
              <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                GP1
              </Text>
            </View>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                Group1
              </Text>
              <Text style={[styles.timeText, { color: colors.muted }]}>
                Yesterday
              </Text>
            </View>

            <View style={styles.contactRow}>
              <Text
                style={[styles.messageText, { color: colors.muted }]}
                numberOfLines={1}
              >
                {truncateMessage(
                  "Max: Thanks for the update, see you tomorrow",
                )}
              </Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  headerTextWrap: {
    gap: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  searchIcon: {
    fontSize: 22,
    color: "#94A3B8",
    lineHeight: 22,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },
  listContent: {
    paddingBottom: 20,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  avatarWrap: {
    marginRight: 12,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarG: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4F46E5",
  },
  contactInfo: {
    flex: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginRight: 10,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginTop: 4,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
});
