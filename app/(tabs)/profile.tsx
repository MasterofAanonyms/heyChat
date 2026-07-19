import { useAppTheme } from "@/context/app-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [about, setAbout] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  let headerHeight = 0;
  const keyboardOffset = Platform.select({
    ios: headerHeight + 30,
    android: 0,
  });

  async function loadProfile() {
    setLoading(true);
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) return;

      const storedUser = JSON.parse(userString);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/get-profile.php?mobile=${storedUser.mobile}`
      );
      const text = await response.text();
      const data = JSON.parse(text);

      if (data.status === "success") {
        setFirstName(data.user.fname ?? "");
        setLastName(data.user.lname ?? "");
        setMobile(data.user.mobile ?? "");
        setAbout(data.user.about ?? "");
        setProfileImg(data.user.img_url ?? null);

        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      } else {
        console.log("Profile load failed:", data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function handleChangePhoto() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Camera roll permission is required to select photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (result.canceled || !result.assets[0]) return;

      const pickedUri = result.assets[0].uri;

      // Show the picked photo instantly while it uploads
      setProfileImg(pickedUri);
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("mobile", mobile);
      formData.append("image", {
        uri: pickedUri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/profile/upload-image.php`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const text = await response.text();
      console.log("RAW UPLOAD RESPONSE:", text);

      const data = JSON.parse(text);

      if (data.status === "success") {
        setProfileImg(data.img_url);

        // Keep AsyncStorage in sync with the new image path
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          user.img_url = data.img_url;
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        alert(`Error: ${data.message}`);
        // Revert preview since the upload failed
        loadProfile();
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image");
      loadProfile();
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSaveChanges() {
    if (!firstName.trim() || !lastName.trim()) {
      alert("First name and last name are required");
      return;
    }

    setSaving(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      const payload = { mobile, fname: firstName, lname: lastName, about };

      const response = await fetch(`${apiUrl}/profile/update-profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (data.status === "success") {
        alert("Profile updated successfully!");
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        setProfileImg(data.user.img_url ?? null);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

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

          {about.trim().length > 0 && (
            <View style={styles.aboutBanner}>
              <Text style={[styles.aboutText, { color: colors.text }]}>
                {about}
              </Text>
            </View>
          )}

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
              {profileImg &&
              (profileImg.startsWith("file://") || profileImg.startsWith("content://")) ? (
                <Image source={{ uri: profileImg }} style={styles.avatarImage} />
              ) : profileImg ? (
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${profileImg}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={[styles.avatarText, { color: colors.rowIcon }]}>
                  {initials}
                </Text>
              )}

              {uploadingPhoto && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}

              <Pressable
                style={styles.cameraButton}
                onPress={handleChangePhoto}
                disabled={uploadingPhoto}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </Pressable>
            </View>

            <Text style={[styles.photoTitle, { color: colors.text }]}>
                {firstName} {lastName}
            </Text>
            <Text style={[styles.photoSubtitle, { color: colors.muted }]}>
              Tap change photo to update your image
            </Text>

            <Pressable
              style={styles.changeButton}
              onPress={handleChangePhoto}
              disabled={uploadingPhoto}
            >
              <Text style={styles.changeButtonText}>
                {uploadingPhoto ? "Uploading..." : "Change Photo"}
              </Text>
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
              colors={colors}
              keyboardType="phone-pad"
            />
          </View>

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
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
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
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
        editable={!!onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  keyboardView: { flex: 1, width: "100%" },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { marginTop: 4, fontSize: 14 },
  aboutBanner: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  aboutText: {
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
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
    overflow: "hidden",
  },
  avatarText: { fontSize: 26, fontWeight: "800" },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 45,
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
  photoTitle: { fontSize: 18, fontWeight: "700" },
  photoSubtitle: { marginTop: 4, fontSize: 13, textAlign: "center" },
  changeButton: {
    marginTop: 14,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  changeButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  formCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 18 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginLeft: 4 },
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
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});