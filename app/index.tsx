import Feather from "@expo/vector-icons/Feather";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function Signin() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  useEffect(() => {

        async function checkUser() {

            const user = await AsyncStorage.getItem("user");

            if (user) {
                router.replace("/(tabs)/home");
            } else {

                setIsLoading(false);

            }


        }

        checkUser();

    }, []);

  let headerHeight = 0;

  const keyboardOffset = Platform.select({
    ios: headerHeight + 30,
    android: 0,
  });

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
            source={require("../assets/images/login.png")}
            style={styles.img}
          />

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Sign In</Text>
            <Text style={styles.headerSubtitle}>Hey, welcome back! 👋</Text>
          </View>

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

          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.signInButtonPressed,
            ]}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Do not have an account? </Text>
            <Pressable
              onPress={() => {
                router.push("/signup");
              }}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  img: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 5,
  },
  headerContainer: {
    alignItems: "center",
    width: "90%",
    marginBottom: 20,
  },
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  signUpText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "700",
  },
});
