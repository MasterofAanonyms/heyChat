import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  let headerHeight = 0;

  const keyboardOffset = Platform.select({
    ios: headerHeight + 30,
    android: 0,
  });

  async function signupRequest() {
    if (
      firstName === "" ||
      lastName === "" ||
      phone === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      Alert.alert("Missing details", "Please enter your details.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Authentication error", "Password did not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/regProcess.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, phone, password }),
        },
      );

      const text = await response.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (data.status === "success") {
        Alert.alert("Success", "Account created successfully! Please Sign in.");
        router.back(); // goes back to Sign In screen
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../assets/images/login2.png")}
            style={styles.img}
          />

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Sign up to get started with heyChat!
            </Text>
          </View>

          {/* Name Inputs */}
          <View style={styles.inputWrapper}>
            <Feather
              name="user"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="First Name"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather
              name="user"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Last Name"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Mobile Input */}
          <View style={styles.inputWrapper}>
            <Feather
              name="phone"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Feather
              name="lock"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setSecureTextEntry(!secureTextEntry)}
              style={styles.eyeIcon}
            >
              <Feather
                name={secureTextEntry ? "eye-off" : "eye"}
                size={20}
                color="#94A3B8"
              />
            </Pressable>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Feather
              name="lock"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Confirm Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={secureConfirmTextEntry}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable
              onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
              style={styles.eyeIcon}
            >
              <Feather
                name={secureConfirmTextEntry ? "eye-off" : "eye"}
                size={20}
                color="#94A3B8"
              />
            </Pressable>
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signUpButton,
              pressed && styles.signUpButtonPressed,
            ]}
            onPress={signupRequest}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </Pressable>

          {/* Footer Navigation */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1, width: "100%" },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  img: { width: 200, height: 200, resizeMode: "contain", marginTop: 5 },
  headerContainer: { alignItems: "center", width: "90%", marginBottom: 20 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  inputWrapper: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  inputIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    height: "100%",
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
  },
  eyeIcon: { padding: 4 },
  signUpButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  signUpButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  signUpButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: { color: "#64748B", fontSize: 14 },
  signInText: { color: "#4F46E5", fontSize: 14, fontWeight: "700" },
});
