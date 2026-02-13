// app/(auth)/login.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { translateClerkError } from "../../utils/clerkErrors";
import Accueil from "./index";

const Login = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const [loginData, setLoginData] = useState({ id: "", pass: "" });
    const [isPatience, setIsPatience] = useState(false);

    const tenterConnexion = async () => {
        if (!isLoaded || !loginData.id || !loginData.pass) {
            return;
        }
        setIsPatience(true);

        try {
            const connectReq = await signIn.create({
                identifier: loginData.id,
                password: loginData.pass,
            });

            if (connectReq.status === "complete") {
                await setActive({ session: connectReq.createdSessionId });
                router.replace("/(main)/(home)");
            }
        } catch (e) {
            Alert.alert("Oups !", translateClerkError(e));
        } finally {
            setIsPatience(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Image source={require("../../assets/site/ft-logo.png")} style={styles.mainLogo} resizeMode="contain"/>
                <Text style={styles.bigTitle}>FoodTrack</Text>
                <Text style={styles.tagline}>Ravi de vous revoir parmi nous !</Text>
            </View>

            <View style={styles.formZone}>
                <View style={styles.inputWrap}>
                    <Text style={styles.labelTitle}>Email ou Pseudo</Text>
                    <TextInput style={styles.inputField} autoCapitalize="none" value={loginData.id} placeholder="votre@mail.com" onChangeText={(val) => setLoginData({...loginData, id: val})}/>
                </View>

                <View style={styles.inputWrap}>
                    <Text style={styles.labelTitle}>Mot de passe</Text>
                    <TextInput style={styles.inputField} value={loginData.pass} placeholder="••••••••" secureTextEntry onChangeText={(val) => setLoginData({...loginData, pass: val})}/>
                </View>
            </View>

            <View style={{paddingTop: 10}}>
                <Pressable style={({ pressed }) => [styles.mainBtn, isPatience && { opacity: 0.7 }, pressed && { transform: [{ scale: 0.98 }] }]} onPress={tenterConnexion} disabled={isPatience}>
                    {isPatience ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.btnLabel}>Se connecter</Text>)}
                </Pressable>

                <View style={styles.subLinks}>
                    <Text style={{ color: "#777" }}>Nouveau ici ? </Text>
                    <Link href="/signup" asChild>
                        <Pressable>
                            <Text style={{color: "#0a7ea4", fontWeight: "bold"}}>Créer un compte</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </View>
    );
}

export default Login;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    topSection: {
        alignItems: "center",
        marginBottom: 100
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
    formZone: {
        width: "100%",
    },
    inputWrap: {
        marginBottom: 20,
    },
    labelTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#555",
        marginBottom: 6,
        textTransform: "uppercase",
    },
    inputField: {
        backgroundColor: "#F8F8F8",
        height: 58,
        borderRadius: 18,
        paddingHorizontal: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#EEE",
    },
    mainBtn: {
        backgroundColor: "#0a7ea4",
        height: 62,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    btnLabel: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
    subLinks: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 35,
    }
});