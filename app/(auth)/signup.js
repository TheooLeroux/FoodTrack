// app/(auth)/signup.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { translateClerkError } from '../../utils/clerkErrors';
import { initProfile } from '../../utils/database';

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [form, setForm] = useState({ mail: '', pseudo: '', pass: '' });
    const [codeVerif, setCodeVerif] = useState('');
    const [enAttente, setEnAttente] = useState(false);
    const [isAction, setIsAction] = useState(false);

    const lancerInscription = async () => {
        if (!isLoaded) return;
        setIsAction(true);
        try {
            await signUp.create({
                emailAddress: form.mail,
                username: form.pseudo,
                password: form.pass
            });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setEnAttente(true);
        } catch (err) {
            Alert.alert("Oups", translateClerkError(err));
        } finally {
            setIsAction(false);
        }
    };

    const validerCodeEmail = async () => {
        if (!isLoaded) return;
        setIsAction(true);
        try {
            const tentative = await signUp.attemptEmailAddressVerification({ code: codeVerif });

            if (tentative.status === 'complete') {
                await initProfile(
                    tentative.createdUserId,
                    form.pseudo,
                    form.mail
                );

                await setActive({ session: tentative.createdSessionId });
                router.replace('/(main)/(home)');
            }
        } catch (err) {
            Alert.alert("Code invalide", translateClerkError(err));
        } finally {
            setIsAction(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.topSection}>
                    <Image source={require("../../assets/site/ft-logo.png")} style={styles.mainLogo} resizeMode="contain"/>
                    <Text style={styles.bigTitle}>FoodTrack</Text>
                    <Text style={styles.tagline}>Rejoingnez l'aventure !</Text>
                </View>

                {enAttente ? (
                    <View style={styles.formZone}>
                        <View style={styles.inputWrap}>
                            <Text style={styles.labelTitle}>Code de vérification</Text>
                            <TextInput
                                style={styles.inputField}
                                value={codeVerif}
                                placeholder="123456"
                                onChangeText={setCodeVerif}
                                keyboardType="numeric"
                            />
                        </View>
                        <Pressable
                            style={({ pressed }) => [
                                styles.mainBtn,
                                isAction && { opacity: 0.7 },
                                pressed && { transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={validerCodeEmail}
                        >
                            {isAction ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnLabel}>Vérifier mon email</Text>}
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.formZone}>
                        <View style={styles.inputWrap}>
                            <Text style={styles.labelTitle}>Nom d'utilisateur</Text>
                            <TextInput
                                style={styles.inputField}
                                autoCapitalize="none"
                                value={form.pseudo}
                                placeholder="SuperSalade"
                                onChangeText={(val) => setForm({...form, pseudo: val})}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.labelTitle}>Email</Text>
                            <TextInput
                                style={styles.inputField}
                                autoCapitalize="none"
                                value={form.mail}
                                placeholder="votre@mail.com"
                                onChangeText={(val) => setForm({...form, mail: val})}
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.labelTitle}>Mot de passe</Text>
                            <TextInput
                                style={styles.inputField}
                                value={form.pass}
                                placeholder="Min. 8 caractères"
                                secureTextEntry
                                onChangeText={(val) => setForm({...form, pass: val})}
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.mainBtn,
                                isAction && { opacity: 0.7 },
                                pressed && { transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={lancerInscription}
                        >
                            {isAction ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnLabel}>Créer mon compte</Text>}
                        </Pressable>

                        <View style={styles.subLinks}>
                            <Text style={{color: "#777"}}>Déjà inscrit ? </Text>
                            <Link href="/login" asChild>
                                <Pressable>
                                    <Text style={{color: '#0a7ea4', fontWeight: 'bold'}}>Se connecter</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default SignUp;


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
        width: '100%',
    },
    inputWrap: {
        marginBottom: 20,
    },
    labelTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    inputField: {
        backgroundColor: '#F8F8F8',
        height: 58,
        borderRadius: 18,
        paddingHorizontal: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    mainBtn: {
        backgroundColor: '#0a7ea4',
        height: 62,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        elevation: 3,
        marginTop: 10
    },
    btnLabel: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    subLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 35,
    }
});