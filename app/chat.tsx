import { useAppTheme } from "@/context/app-theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string | number;
  message: string;
  sent_at: string;
  sender: string; // mobile of whoever sent it
  sender_name?: string; // only present for group messages
};

const POLL_INTERVAL_MS = 3000;

export default function Chat() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const userName = (params.userName as string) ?? "";
  const isGroup = params.isGroup === "true";
  const otherMobile = params.userMobile as string | undefined;
  const groupId = params.groupId as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myMobile, setMyMobile] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function timeFormat(time: string) {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getInitials(name: string) {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  async function loadMessages(showLoading = false) {
    if (!myMobile) return;
    if (showLoading) setLoading(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      let url: string;

      if (isGroup && groupId) {
        url = `${apiUrl}/chat/get-group-messages.php?grpId=${groupId}`;
      } else if (otherMobile) {
        url = `${apiUrl}/chat/get-messages.php?mobile=${myMobile}&otherMobile=${otherMobile}`;
      } else {
        return;
      }

      const response = await fetch(url);
      const text = await response.text();
      const data = JSON.parse(text);

      if (data.status === "success") {
        setMessages(data.messages);
      } else {
        console.log("Failed to load messages:", data.message);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  // Load logged-in user, then start initial load + polling
  useEffect(() => {
    async function init() {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setMyMobile(user.mobile);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!myMobile) return;

    loadMessages(true);

    pollRef.current = setInterval(() => {
      loadMessages(false);
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [myMobile, groupId, otherMobile]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !myMobile || sending) return;

    setText("");
    setSending(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      let url: string;
      let body: Record<string, string>;

      if (isGroup && groupId) {
        url = `${apiUrl}/chat/send-group-message.php`;
        body = { grpId: groupId, sender: myMobile, message: trimmed };
      } else if (otherMobile) {
        url = `${apiUrl}/chat/send-message.php`;
        body = { sender: myMobile, receiver: otherMobile, message: trimmed };
      } else {
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.status === "success") {
        // Refresh immediately so the sent message shows without waiting for the next poll
        await loadMessages(false);
      } else {
        alert(`Error: ${data.message}`);
        setText(trimmed); // restore the text so the user doesn't lose what they typed
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Entypo name="chevron-left" size={26} color={colors.text} />
          </Pressable>

          <View style={styles.headerAvatarWrap}>
            {isGroup ? (
              <View style={[styles.avatarSquare, { backgroundColor: colors.rowIconBg }]}>
                <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                  {getInitials(userName)}
                </Text>
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.rowIconBg }]}>
                <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                  {getInitials(userName)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={[styles.headerStatus, { color: colors.muted }]}>
              {isGroup ? "Group chat" : ""}
            </Text>
          </View>

          <Pressable style={styles.optionsButton}>
            <Feather name="more-vertical" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          inverted
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 40 }}>
              No messages yet. Say hello!
            </Text>
          }
          renderItem={({ item, index }) => {
            const isMe = item.sender === myMobile;

            const nextItem = messages[index + 1];
            const isFirstInGroup = !nextItem || nextItem.sender !== item.sender;

            return (
              <View
                style={[
                  styles.messageRow,
                  { justifyContent: isMe ? "flex-end" : "flex-start" },
                  isFirstInGroup && { marginTop: 10 },
                ]}
              >
                {isGroup && !isMe && item.sender_name && (
                  <Text style={[styles.senderName, { color: colors.muted }]}>
                    {item.sender_name}
                  </Text>
                )}
                <View
                  style={[
                    styles.bubble,
                    isMe
                      ? [styles.bubbleMe, { backgroundColor: "#4F46E5" }]
                      : [
                          styles.bubbleOther,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ],
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: isMe ? "#FFFFFF" : colors.text }]}>
                    {item.message}
                  </Text>
                </View>
                {isFirstInGroup && (
                  <Text
                    style={[
                      styles.timeText,
                      { color: colors.muted },
                      isMe ? { textAlign: "right" } : { textAlign: "left" },
                    ]}
                  >
                    {timeFormat(item.sent_at)}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { backgroundColor: colors.card, borderTopColor: colors.divider },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.background, color: colors.text },
            ]}
            placeholder="Type a message"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
          />

          <Pressable
            style={[styles.sendButton, { opacity: text.trim() && !sending ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  backButton: { padding: 4, marginRight: 2 },
  headerAvatarWrap: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSquare: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700" },
  headerTextWrap: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "700" },
  headerStatus: { fontSize: 12, marginTop: 1 },
  optionsButton: { padding: 6 },

  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "column",
    marginBottom: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  timeText: {
    fontSize: 11,
    marginTop: 3,
    marginHorizontal: 4,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});