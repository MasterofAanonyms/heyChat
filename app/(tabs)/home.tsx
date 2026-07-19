import { useAppTheme } from "@/context/app-theme";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type User = {
  mobile: string;
  fname: string;
  lname: string;
  img_url: string | null;
};

type ChatItem =
  | {
      type: "direct";
      user: {
        fname: string;
        lname: string;
        mobile: string;
        img: string | null;
        status_id: number; // 1 = Active, 2 = Inactive
      };
      last_message: {
        message: string;
        sent_at: string;
        chat_chat_id: string;
      };
    }
  | {
      type: "group";
      group: {
        id: number;
        name: string;
      };
      last_message: {
        message: string;
        sender: string;
        sent_at: string;
        chat_chat_id: string;
      };
    };

export default function Home() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const [chatData, setChatData] = useState<ChatItem[]>([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");

  // Group creation states
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const truncateMessage = (message: string) =>
    message.length > 25 ? message.slice(0, 25) + "..." : message;

  function timeFormat(time: string) {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getGroupInitials(name: string) {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  async function loadChats(mobile: string) {
    setIsRefresh(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      console.log(
        "Loading chats from:",
        `${apiUrl}/chat/get-chats.php?mobile=${mobile}`,
      );

      const response = await fetch(
        `${apiUrl}/chat/get-chats.php?mobile=${mobile}`,
      );
      const text = await response.text();
      console.log("RAW CHATS RESPONSE:", text);

      const data = JSON.parse(text);
      console.log("PARSED CHATS DATA:", data);

      if (response.ok) {
        setChatData(data);
      } else {
        alert(`${response.status} : ${data.msg}`);
      }
    } catch (err) {
      console.error("Error loading chats:", err);
      alert("Failed to load chats");
    } finally {
      setIsRefresh(false);
    }
  }

  async function getUser() {
    const userString = await AsyncStorage.getItem("user");
    if (userString) {
      const userObj = JSON.parse(userString);
      setUserName(userObj.fname);
      setUserMobile(userObj.mobile);
      loadChats(userObj.mobile);
    }
  }

  async function fetchUsers() {
    if (!userMobile) return;

    setLoadingUsers(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/group/get-users.php?mobile=${userMobile}`,
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        alert("Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Error loading users");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedUsers.size === 0) {
      alert("Please select at least one user");
      return;
    }

    setCreatingGroup(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/group/create-group.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_name: groupName,
          creator_mobile: userMobile,
          user_mobiles: Array.from(selectedUsers),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Group created successfully!");
        // Reset form
        setGroupName("");
        setSelectedUsers(new Set());
        setModalVisible(false);
        // Refresh chats
        if (userMobile) loadChats(userMobile);
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  }

  function toggleUserSelection(mobile: string) {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(mobile)) {
      newSelected.delete(mobile);
    } else {
      newSelected.add(mobile);
    }
    setSelectedUsers(newSelected);
  }

  function handleOpenModal() {
    setGroupName("");
    setSelectedUsers(new Set());
    fetchUsers();
    setModalVisible(true);
  }

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: colors.title }]}>Chats</Text>
        </View>
        <Pressable style={styles.bellButton} onPress={handleOpenModal}>
          <FontAwesome6 name="people-group" size={16} color="#ffff" />
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
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create New Group
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Group Name Input */}
            <View style={styles.modalContent}>
              <TextInput
                style={[
                  styles.groupNameInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Group name"
                placeholderTextColor={colors.muted}
                value={groupName}
                onChangeText={setGroupName}
                editable={!creatingGroup}
              />

              {/* Selected Users Count */}
              <Text style={[styles.selectedCountText, { color: colors.muted }]}>
                Selected: {selectedUsers.size} user
                {selectedUsers.size !== 1 ? "s" : ""}
              </Text>

              {/* Users List */}
              {loadingUsers ? (
                <ActivityIndicator
                  size="large"
                  color={colors.text}
                  style={{ marginTop: 20 }}
                />
              ) : (
                <ScrollView style={styles.usersList} nestedScrollEnabled>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.mobile}
                      style={[
                        styles.userItem,
                        {
                          backgroundColor: selectedUsers.has(user.mobile)
                            ? colors.rowIconBg
                            : colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => toggleUserSelection(user.mobile)}
                      disabled={creatingGroup}
                    >
                      {/* Avatar */}
                      {user.img_url ? (
                        <Image
                          source={{
                            uri: `${process.env.EXPO_PUBLIC_API_URL}${user.img_url}`,
                          }}
                          style={styles.userAvatar}
                        />
                      ) : (
                        <View
                          style={[
                            styles.userAvatar,
                            styles.userAvatarFallback,
                            { backgroundColor: colors.rowIconBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.userAvatarText,
                              { color: colors.rowIcon },
                            ]}
                          >
                            {user.fname.charAt(0)}
                            {user.lname.charAt(0)}
                          </Text>
                        </View>
                      )}

                      {/* User Info */}
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.text }]}>
                          {user.fname} {user.lname}
                        </Text>
                        <Text
                          style={[styles.userMobile, { color: colors.muted }]}
                        >
                          {user.mobile}
                        </Text>
                      </View>

                      {/* Checkbox */}
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: colors.text,
                            backgroundColor: selectedUsers.has(user.mobile)
                              ? colors.rowIcon
                              : "transparent",
                          },
                        ]}
                      >
                        {selectedUsers.has(user.mobile) && (
                          <Text style={{ color: colors.card, fontSize: 14 }}>
                            ✓
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  {
                    backgroundColor: creatingGroup
                      ? colors.muted
                      : colors.rowIcon,
                    opacity:
                      creatingGroup || selectedUsers.size === 0 ? 0.6 : 1,
                  },
                ]}
                onPress={handleCreateGroup}
                disabled={creatingGroup || selectedUsers.size === 0}
              >
                {creatingGroup ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>

      <FlatList
        data={chatData}
        keyExtractor={(item) =>
          `${item.type}-${item.last_message.chat_chat_id}`
        }
        contentContainerStyle={styles.listContent}
        refreshing={isRefresh}
        onRefresh={() => {
          if (userMobile) loadChats(userMobile);
        }}
        ListEmptyComponent={
          !isRefresh ? (
            <Text
              style={{
                color: colors.muted,
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No conversations yet.
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: colors.divider }]}
          />
        )}
        renderItem={({ item }) => {
          const isGroup = item.type === "group";

          const displayName = isGroup
            ? item.group.name
            : `${item.user.fname} ${item.user.lname}`;

          return (
            <Pressable
              style={styles.contactCard}
              onPress={() => {
                if (isGroup) {
                  router.push({
                    pathname: "/chat",
                    params: {
                      chatId: item.last_message.chat_chat_id,
                      groupId: item.group.id,
                      userName: item.group.name,
                      isGroup: "true",
                    },
                  });
                } else {
                  router.push({
                    pathname: "/chat",
                    params: {
                      chatId: item.last_message.chat_chat_id,
                      userName: `${item.user.fname} ${item.user.lname}`,
                      userMobile: item.user.mobile,
                    },
                  });
                }
              }}
            >
              <View style={styles.avatarWrap}>
                {isGroup ? (
                  <View
                    style={[
                      styles.avatarSquare,
                      { backgroundColor: colors.rowIconBg },
                    ]}
                  >
                    <Text
                      style={[styles.avatarText, { color: colors.rowIcon }]}
                    >
                      {getGroupInitials(item.group.name)}
                    </Text>
                  </View>
                ) : item.user.img ? (
                  <>
                    <Image
                      source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}${item.user.img}`,
                      }}
                      style={styles.avatar}
                    />
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            item.user.status_id === 1 ? "#22C55E" : "#D1D5DB",
                          borderColor: colors.background,
                        },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: colors.rowIconBg },
                      ]}
                    >
                      <Text
                        style={[styles.avatarText, { color: colors.rowIcon }]}
                      >
                        {item.user.fname.charAt(0)}
                        {item.user.lname.charAt(0)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            item.user.status_id === 1 ? "#22C55E" : "#D1D5DB",
                          borderColor: colors.background,
                        },
                      ]}
                    />
                  </>
                )}
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Text style={[styles.contactName, { color: colors.text }]}>
                    {displayName}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.muted }]}>
                    {timeFormat(item.last_message.sent_at)}
                  </Text>
                </View>

                <View style={styles.contactRow}>
                  <Text
                    style={[styles.messageText, { color: colors.muted }]}
                    numberOfLines={1}
                  >
                    {isGroup
                      ? `${item.last_message.sender}: ${truncateMessage(item.last_message.message)}`
                      : truncateMessage(item.last_message.message)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    padding: 35,
    alignItems: "center",
    borderRadius: 10,
  },
  modalText: { marginBottom: 15, textAlign: "center" },
  container: {
    flex: 1,
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
  headerTextWrap: { gap: 5 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A" },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
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
  searchInput: { flex: 1, fontSize: 15, color: "#0F172A" },
  listContent: { paddingBottom: 20 },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  avatarWrap: {
    marginRight: 12,
    position: "relative",
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSquare: {
    width: 52,
    height: 52,
    borderRadius: 14, // rounded square, not a full circle
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#4F46E5" },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  contactInfo: { flex: 1 },
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
  timeText: { fontSize: 12, color: "#94A3B8" },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  groupNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  selectedCountText: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  usersList: {
    flex: 1,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 12,
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});