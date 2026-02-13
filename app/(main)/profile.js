// app/(main)/profile.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getProfile, saveProfile, healthUtils, killDB } from "../../utils/database";
import { Ionicons } from "@expo/vector-icons";

const MonProfil = () => {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [dataLocale, setDataLocale] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [enEdition, setEnEdition] = useState(false);

    const [mesInfos, setMesInfos] = useState({
        poids: "",
        taille: "",
        age: "",
        cibleKcal: "",
        genre: "M",
        avatarPath: null
    });

    useEffect(() => {
        recupDonnees();
    }, [user]);

    const recupDonnees = async () => {
        if (!user?.id) return;

        try {
            const profil = await getProfile(user.id);
            setDataLocale(profil);

            if (profil) {
                setMesInfos({
                    poids: profil.weight ? String(profil.weight) : "",
                    taille: profil.height ? String(profil.height) : "",
                    age: profil.age ? String(profil.age) : "",
                    cibleKcal: profil.daily_goal ? String(profil.daily_goal) : "2000",
                    genre: profil.gender || "M",
                    avatarPath: profil.profile_pic_local
                });
            }
        } catch (e) {
            console.log("Erreur chargement profil:", e);
        } finally {
            setChargement(false);
        }
    };

    const ouvrirGalerie = async () => {
        let resultat = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!resultat.canceled) {
            setMesInfos(curr => ({ ...curr, avatarPath: resultat.assets[0].uri }));
        }
    };

    const validerChangements = async () => {
        if (!user?.id) return;

        const poidsClean = parseFloat(mesInfos.poids.replace(",", "."));
        const tailleClean = parseFloat(mesInfos.taille.replace(",", "."));
        const goalClean = parseInt(mesInfos.cibleKcal.replace(/[.,]/g, ""), 10);
        await saveProfile(user.id, {
            weight: poidsClean,
            height: tailleClean,
            daily_goal: goalClean,
            age: parseInt(mesInfos.age),
            gender: mesInfos.genre,
            profile_pic_local: mesInfos.avatarPath,
            first_connection: 0
        });

        await recupDonnees();
        setEnEdition(false);
    };

    const gererDeconnexion = async () => {
        try {
            await signOut();
            router.replace("/");
        } catch (err) {
            console.error("Erreur deco:", err);
        }
    };

    const estimerMaintien = () => {
        const p = parseFloat(mesInfos.poids.replace(",", "."));
        const t = parseFloat(mesInfos.taille.replace(",", "."));
        const a = parseInt(mesInfos.age);

        if (!p || !t || !a) return null;

        let base = (10 * p) + (6.25 * t) - (5 * a);
        const total = mesInfos.genre === "M" ? base + 5 : base - 161;

        return Math.round(total * 1.2);
    };

    const resetTout = () => {
        Alert.alert("Attention", "Tu vas supprimer toutes tes données locales. Sûr ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: async () => {await killDB();alert("C'est fait. Redémarre l'app.");}}
        ]);
    };

    if (chargement) return (
        <View style={styles.centerLoad}>
            <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
    );

    const imc = healthUtils.calculateBMI(dataLocale?.weight, dataLocale?.height);
    const maintenance = estimerMaintien();

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.mainView}>
            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
                <View style={styles.topRow}>
                    <Pressable style={[styles.wrapAvatar, enEdition && styles.avatarEditable]} onPress={enEdition ? ouvrirGalerie : null}>
                        {mesInfos.avatarPath ? (
                            <Image source={{ uri: mesInfos.avatarPath }} style={styles.pic} />
                        ) : user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.pic} />
                        ) : (
                            <Text style={styles.picLetter}>{user?.username?.[0]?.toUpperCase()}</Text>
                        )}

                        {enEdition && (
                            <View style={styles.badgeEdit}>
                                <Ionicons name="camera" size={12} color="#FFF" />
                            </View>
                        )}
                    </Pressable>

                    <View style={styles.userIdentity}>
                        <Text style={styles.uName}>{user?.username}</Text>
                        <Text style={styles.uMail}>{user?.primaryEmailAddress?.emailAddress}</Text>
                    </View>
                </View>

                <View style={styles.boxStats}>
                    <View>
                        <Text style={styles.lblImc}>IMC ACTUEL</Text>
                        <Text style={styles.valImc}>{imc || "--"}</Text>
                    </View>
                    <View style={styles.sepVert} />
                    <View style={styles.colResult}>
                        <Text style={styles.txtResult}>
                            {imc ? healthUtils.getBMICategory(imc) : "Incomplet"}
                        </Text>
                        <Text style={styles.txtCible}>
                            {dataLocale?.daily_goal ? `Cible : ${dataLocale.daily_goal} kcal` : "Pas d'objectif"}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerForm}>
                    <Text style={styles.titleForm}>Mes infos</Text>
                    {enEdition && <Text style={styles.badgeModif}>ÉDITION</Text>}
                </View>

                <View style={styles.cardForm}>
                    <View style={styles.rowItem}>
                        <View style={styles.lineContent}>
                            <Text style={styles.label}>Sexe</Text>
                            {enEdition ? (
                                <View style={styles.switchGenre}>
                                    {["M", "F"].map((g) => (
                                        <Pressable key={g} style={[styles.btnGenre, mesInfos.genre === g && styles.btnGenreOn]} onPress={() => setMesInfos({...mesInfos, genre: g})}>
                                            <Text style={[styles.txtGenre, mesInfos.genre === g && styles.txtGenreOn]}>
                                                {g === "M" ? "Homme" : "Femme"}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.valText}>{mesInfos.genre === "M" ? "Homme" : "Femme"}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.hr} />

                    <LigneSaisie label="Âge" val={mesInfos.age} set={(v) => setMesInfos({...mesInfos, age: v})} edit={enEdition} unit="ans" />
                    <View style={styles.hr} />

                    <LigneSaisie label="Poids" val={mesInfos.poids} set={(v) => setMesInfos({...mesInfos, poids: v})} edit={enEdition} unit="kg" />
                    <View style={styles.hr} />

                    <LigneSaisie label="Taille" val={mesInfos.taille} set={(v) => setMesInfos({...mesInfos, taille: v})} edit={enEdition} unit="cm" />
                    <View style={styles.hr} />

                    <LigneSaisie
                        label="Objectif"
                        val={mesInfos.cibleKcal}
                        set={(v) => setMesInfos({...mesInfos, cibleKcal: v})}
                        edit={enEdition}
                        unit="kcal"
                        hint={maintenance ? `Maintien estimé : ~${maintenance} kcal` : null}
                    />
                </View>

                <View style={styles.areaBtn}>
                    <Pressable style={({pressed}) => [styles.btnMain, !enEdition && styles.btnSec, pressed && styles.pressed]} onPress={enEdition ? validerChangements : () => setEnEdition(true)}>
                        <Text style={[styles.txtMain, !enEdition && styles.txtSec]}>
                            {enEdition ? "Enregistrer" : "Modifier mon profil"}
                        </Text>
                    </Pressable>

                    {!enEdition && (
                        <Pressable style={({pressed}) => [styles.btnDanger, pressed && styles.pressed]} onPress={gererDeconnexion}>
                            <Text style={styles.txtDanger}>Se déconnecter</Text>
                        </Pressable>
                    )}

                    {/*<Pressable style={styles.areaDebug} onPress={resetTout}>*/}
                    {/*    <Text style={styles.txtDebug}>Reset Database (Debug)</Text>*/}
                    {/*</Pressable>*/}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default MonProfil;

const LigneSaisie = ({ label, val, set, edit, unit, hint }) => (
    <View style={styles.rowItem}>
        <View style={styles.lineContent}>
            <Text style={styles.label}>{label}</Text>
            {edit ? (
                <View style={styles.inputBox}>
                    <TextInput style={styles.field} value={val} onChangeText={set} keyboardType="numeric" placeholder="--" placeholderTextColor="#CCC"/>
                    {unit && <Text style={styles.unit}>{unit}</Text>}
                </View>
            ) : (
                <Text style={styles.valText}>{val || "--"} <Text style={styles.valUnit}>{unit}</Text></Text>
            )}
        </View>
        {edit && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
);

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    centerLoad: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollPad: {
        padding: 20,
        paddingBottom: 60,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },
    wrapAvatar: {
        position: "relative",
    },
    avatarEditable: {
        opacity: 0.8,
    },
    pic: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: "#FFF",
    },
    picLetter: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#e6f4f9",
        textAlign: "center",
        lineHeight: 64,
        fontSize: 24,
        fontWeight: "bold",
        color: "#0a7ea4",
        overflow: "hidden",
    },
    badgeEdit: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#0a7ea4",
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#FFF",
    },
    userIdentity: {
        marginLeft: 15,
        flex: 1,
    },
    uName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1C1C1E",
    },
    uMail: {
        fontSize: 13,
        color: "#8E8E93",
    },
    boxStats: {
        flexDirection: "row",
        backgroundColor: "#0a7ea4",
        padding: 20,
        borderRadius: 18,
        alignItems: "center",
        marginBottom: 25,
        shadowColor: "#0a7ea4",
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 4,},
        shadowRadius: 8,
        elevation: 4,
    },
    lblImc: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 11,
        fontWeight: "bold",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    valImc: {
        color: "#FFF",
        fontSize: 30,
        fontWeight: "900",
        marginTop: 2,
    },
    sepVert: {
        width: 1,
        height: 35,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginHorizontal: 15,
    },
    colResult: {
        flex: 1,
        paddingLeft: 5,
    },
    txtResult: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    txtCible: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        marginTop: 2,
    },
    headerForm: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    titleForm: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1C1C1E",
    },
    badgeModif: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#0a7ea4",
        backgroundColor: "#e6f4f9",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    cardForm: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 5,
        borderWidth: 1,
        borderColor: "#EFEFEF",
    },
    rowItem: {
        paddingVertical: 14,
        paddingHorizontal: 15,
    },
    lineContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    hr: {
        height: 1,
        backgroundColor: "#F5F5F5",
        marginLeft: 15,
    },
    label: {
        fontSize: 15,
        color: "#666",
    },
    valText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1C1C1E",
    },
    valUnit: {
        fontSize: 13,
        color: "#999",
        fontWeight: "normal",
    },
    hint: {
        fontSize: 12,
        color: "#0a7ea4",
        marginTop: 6,
        textAlign: "right",
        fontStyle: "italic",
        fontWeight: "500",
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F4F7",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 34,
        minWidth: 80,
        justifyContent: "flex-end",
    },
    field: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1C1C1E",
        textAlign: "right",
        minWidth: 40,
        padding: 0,
    },
    unit: {
        marginLeft: 5,
        color: "#999",
        fontSize: 13,
    },
    switchGenre: {
        flexDirection: "row",
        gap: 8,
    },
    btnGenre: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: "#F0F0F0",
    },
    btnGenreOn: {
        backgroundColor: "#0a7ea4",
    },
    txtGenre: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    txtGenreOn: {
        color: "#FFF",
    },
    areaBtn: {
        marginTop: 25,
    },
    btnMain: {
        backgroundColor: "#0a7ea4",
        height: 50,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0a7ea4",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    btnSec: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#0a7ea4",
        elevation: 0,
    },
    pressed: {
        opacity: 0.8,
    },
    txtMain: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    txtSec: {
        color: "#0a7ea4",
    },
    btnDanger: {
        backgroundColor: "#FEE2E2",
        marginTop: 12,
        height: 50,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    txtDanger: {
        color: "#FF3B30",
        fontWeight: "bold",
        fontSize: 16,
    },
    areaDebug: {
        marginTop: 30,
        opacity: 0.3,
    },
    txtDebug: {
        textAlign: "center",
        fontSize: 10,
    },
});