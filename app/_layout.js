// app/_layout.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { initDB } from "../utils/database";

const Vigile = () => {
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;
        const inMainGroup = segments[0] === "(main)";

        if (isSignedIn && !inMainGroup) {
            router.replace("/(main)/(home)");
        } else if (!isSignedIn && inMainGroup) {
            console.log("Retour au SlpashScreen");
            router.replace("/(auth)");
        }
    }, [isSignedIn, segments, isLoaded]);

    if (!isLoaded) {
        return (
            <View style={styles.centerLoad}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    return <Slot />;
};

export default function RootLayout() {
    useEffect(() => {
        initDB().catch(e => console.log("Erreur init DB:", e));
    }, []);

    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error("Clé Clerk manquante dans le .env !");
    }

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ClerkLoaded>
                <SafeAreaProvider>
                    <SafeAreaView style={styles.container}>
                        <Vigile />
                    </SafeAreaView>
                </SafeAreaProvider>
            </ClerkLoaded>
        </ClerkProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    centerLoad: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF"
    }
});