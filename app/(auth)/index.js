// app/(auth)/index.js
import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const Accueil = () => {
    const router = useRouter();
    const { isLoaded } = useAuth();
    const [Mechant, switchMechant] = useState(false);
    const vibeSalade = useRef(new Animated.Value(0)).current;

    const handleSaladPress = () => {
        switchMechant(true);
        vibeSalade.setValue(0);

        Animated.timing(vibeSalade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };
    if (!isLoaded) return null;


    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Image source={require("../../assets/site/ft-logo.png")} style={styles.mainLogo} resizeMode="contain"/>
                <Text style={styles.bigTitle}>FoodTrack</Text>
                <Text style={styles.tagline}>Ton compagnon nutrition.</Text>
            </View>


            <View style={styles.midSection}>
                <View style={styles.bgCircle} />
                <Pressable onPress={handleSaladPress}>
                    <Animated.Image source={require("../../assets/site/salade.png")} style={[styles.imgSalade, {
                                transform: [{
                                    rotate: vibeSalade.interpolate({
                                        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                        outputRange: ["0deg", "-8deg", "8deg", "-8deg", "8deg", "0deg"],
                                    }),
                                }, {
                                    scale: vibeSalade.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [1, 1.1, 1],
                                    }),
                                },],},]}
                    />
                </Pressable>
            </View>


            <View style={styles.bottomSection}>
                <Pressable style={({ pressed }) => [styles.btn, { backgroundColor: "#0a7ea4" }, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                           onPress={() => router.push("/login")}>
                    <Text style={styles.txtBtn}>Se connecter</Text>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.btn, styles.btnAlt, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                    onPress={() => router.push("/signup")}>
                    <Text style={[styles.txtBtn, { color: "#0a7ea4" }]}>Créer un compte</Text>
                </Pressable>


                <Text style={[styles.txtInviteSalade, Mechant && { color: "#FF3B30", fontWeight: "600" }]}>
                    {Mechant
                        ? "Sérieusement ? Cliquer sur une salade... vous devriez avoir honte."
                        : "Cliquez sur la salade pour une surprise."
                    }
                </Text>
            </View>
        </View>
    );
}

export default Accueil;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    topSection: {
        alignItems: "center",
        marginBottom: 20
    },
    mainLogo: {
        width: 100,
        height: 100,
        marginBottom: 12
    },
    bigTitle: {
        textAlign: "center",
        color: "#0a7ea4",
        fontSize: 34,
        fontWeight: "900",
        letterSpacing: -0.5
    },
    tagline: {
        textAlign: "center",
        color: "#777",
        fontSize: 16,
    },
    midSection: {
        height: 240,
        alignItems: "center",
        justifyContent: "center",
    },
    bgCircle: {
        position: "absolute",
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: "#F0F9FC"
    },
    imgSalade: {
        width: 140,
        height: 140
    },
    bottomSection: {
        width: "100%",
        marginTop: 10
    },
    btn: {
        height: 60,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        // Petit effet d"ombre "fait main"
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    btnAlt: {
        backgroundColor: "#FFF",
        borderWidth: 2,
        borderColor: "#0a7ea4"
    },
    txtBtn: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700"
    },
    txtInviteSalade: {
        textAlign: "center",
        fontSize: 12,
        color: "#AAA",
        marginTop: 10,
        paddingHorizontal: 20
    }
});