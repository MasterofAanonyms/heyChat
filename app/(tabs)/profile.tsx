import { useAppTheme } from "@/context/app-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { colors, isDarkMode } = useAppTheme();
  const [firstName, setFirstName] = useState("Ava");
  const [lastName, setLastName] = useState("Harris");
  const [about, setAbout] = useState(
    "Simple profile screen for your chat app.",
  );
  const [mobile, setMobile] = useState("+1 555 0142");
  const [password, setPassword] = useState("");

  let headerHeight = 0;

  const keyboardOffset = Platform.select({
    ios: headerHeight + 30,
    android: 0,
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.title }]}>Profile</Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>
              Edit your personal details
            </Text>
          </View>

          <View
            style={[
              styles.photoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: isDarkMode ? "#1E293B" : "#E0E7FF" },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                AH
              </Text>
              <Pressable style={styles.cameraButton}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </Pressable>
            </View>

            <Text style={[styles.photoTitle, { color: colors.text }]}>
              Profile Photo
            </Text>
            <Text style={[styles.photoSubtitle, { color: colors.muted }]}>
              Tap change photo to update your image
            </Text>

            <Pressable style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change Photo</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <InputField
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              colors={colors}
            />
            <InputField
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              colors={colors}
            />
            <InputField
              label="About"
              value={about}
              onChangeText={setAbout}
              colors={colors}
              multiline
            />
            <InputField
              label="Mobile"
              value={mobile}
              onChangeText={setMobile}
              colors={colors}
              keyboardType="phone-pad"
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              colors={colors}
              secureTextEntry
              placeholder="Enter new password"
            />
          </View>

          <Pressable style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  colors,
  multiline,
  secureTextEntry,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  colors: {
    card: string;
    border: string;
    title: string;
    subtitle: string;
    text: string;
    muted: string;
    rowIcon: string;
  };
  multiline?: boolean;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.subtitle }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.fieldInput,
          {
            borderColor: colors.border,
            color: colors.text,
            height: multiline ? 110 : 52,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  photoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
  },
  cameraButton: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  photoSubtitle: {
    marginTop: 4,
    fontSize: 13,
    textAlign: "center",
  },
  changeButton: {
    marginTop: 14,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 54,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
