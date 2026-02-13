// app/(main)/(home)/Tuto.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { saveProfile, closeTuto } from "../../../utils/database";

const Tuto = ({ onFinish, userId }) => {
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState({
        genre: "M",
        age: "",
        weight: "",
        height: "",
        targetKcal: "",
        localUri: null,
    });

    useEffect(() => {
        if (step === 5) {
            runCalculBMR();
        }
    }, [step]);

    const runCalculBMR = () => {
        try {
            const w = parseFloat(formData.weight.replace(",", "."));
            const h = parseFloat(formData.height.replace(",", "."));
            const a = parseInt(formData.age);

            if (!w || !h || !a) {
                return;
            }

            let base = (10 * w) + (6.25 * h) - (5 * a);
            let bmr = base;
            if (formData.genre === "M") {
                bmr += 5;
            } else {
                bmr -= 161;
            }

            const maintenance = Math.round((bmr * 1.2));
            setFormData(prev => ({ ...prev, targetKcal: maintenance.toString() }));
        } catch (e) {
            console.log("Erreur calcul BMR", e);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFormData(prev => ({ ...prev, localUri: result.assets[0].uri }));
        }
    };

    const handleNext = async () => {
        if (step === 2 && !formData.age) return;
        if (step === 3 && !formData.weight) return;

        if (step < 7) {
            setStep(step + 1);
        } else {
            const p = parseFloat(formData.weight.replace(",", "."));
            const t = parseFloat(formData.height.replace(",", "."));
            const goal = parseInt(formData.targetKcal);

            await saveProfile(userId, {
                weight: p,
                height: t,
                gender: formData.genre,
                age: parseInt(formData.age),
                profile_pic_local: formData.localUri,
                daily_goal: goal || 2000,
                first_connection: 1
            });

            setStep(8);
        }
    };

    const closeTutoAction = async () => {
        await closeTuto(userId);
        onFinish();
    };

    const getSaladeText = (s) => {
        switch(s) {
            case 0: return "Salut ! Moi c'est Salade. Je vais t'aider à traquer ta nutrition. On fait connaissance ?";
            case 1: return "Pour commencer, tu es ?";
            case 2: return "Quel est ton âge ?";
            case 3: return "Ton poids actuel (en kg) ?";
            case 4: return "Et ta taille en centimètres ?";
            case 5: return "J'ai calculé tes besoins pour maintenir ton poids. Ça te semble correct ?";
            case 6: return "Tu veux ajouter une photo pour ton profil ?";
            case 7: return "C'est tout bon ! On récapitule ?";
            case 8: return "Parfait ! Clique sur le "+" pour ajouter un repas. C'est clair ?";
            default: return "...";
        }
    };

    return (
        <Modal transparent animationType="fade" visible>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                    <View style={styles.bubbleBox}>
                        <Text style={styles.bubbleText}>{getSaladeText(step)}</Text>
                    </View>
                    <View style={styles.bubbleArrow} />
                    <Image source={require("../../../assets/site/salade-parle.png")} style={styles.mascot} resizeMode="contain"/>
                    <View style={styles.formArea}>
                        {step === 1 && (
                            <View style={styles.rowGenre}>
                                {["M", "F"].map((g) => (
                                    <Pressable key={g} style={[styles.btnOption, formData.genre === g && styles.btnOptionActive]} onPress={() => setFormData({...formData, genre: g})}>
                                        <Text style={[styles.txtOption, formData.genre === g && {color: "white"}]}>
                                            {g === "M" ? "Homme" : "Femme"}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {step === 2 && (
                            <TextInput style={styles.bigInput} placeholder="Age" keyboardType="number-pad" value={formData.age} onChangeText={(v) => setFormData({...formData, age: v})} autoFocus/>
                        )}
                        {step === 3 && (
                            <TextInput style={styles.bigInput} placeholder="Poids (kg)" keyboardType="decimal-pad" value={formData.weight} onChangeText={(v) => setFormData({...formData, weight: v})} autoFocus/>
                        )}
                        {step === 4 && (
                            <TextInput style={styles.bigInput} placeholder="Taille (cm)" keyboardType="number-pad" value={formData.height} onChangeText={(v) => setFormData({...formData, height: v})} autoFocus/>
                        )}

                        {step === 5 && (
                            <View>
                                <TextInput style={styles.bigInput} placeholder="Kcal" keyboardType="numeric" value={formData.targetKcal} onChangeText={(v) => setFormData({...formData, targetKcal: v})}/>
                                <Text style={{color: "#EEE", textAlign:"center", fontSize: 12, marginTop: 5}}>
                                    Maintenance estimée
                                </Text>
                            </View>
                        )}

                        {step === 6 && (
                            <Pressable style={styles.photoBox} onPress={pickImage}>
                                {formData.localUri ? (
                                    <Image source={{ uri: formData.localUri }} style={styles.imgPreview} />
                                ) : (
                                    <Text style={{color: "white", fontWeight: "bold"}}>+ Ajouter photo</Text>
                                )}
                            </Pressable>
                        )}

                        {step < 8 ? (
                            <Pressable style={styles.btnNext} onPress={handleNext}>
                                <Text style={styles.txtBtn}>Continuer</Text>
                            </Pressable>
                        ) : (
                            <View style={{ gap: 10 }}>
                                <Pressable style={styles.btnNext} onPress={closeTutoAction}>
                                    <Text style={styles.txtBtn}>J"ai compris !</Text>
                                </Pressable>
                                <Pressable style={styles.btnBack} onPress={() => setStep(0)}>
                                    <Text style={{color: "white"}}>Recommencer</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

export default Tuto


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        padding: 20
    },
    container: {
        width: "100%",
        alignItems: "center"
    },
    bubbleBox: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        width: "100%",
        maxWidth: 320,
        marginBottom: 0
    },
    bubbleText: {
        fontSize: 18,
        color: "#333",
        textAlign: "center",
        fontWeight: "600"
    },
    bubbleArrow: {
        width: 0, height: 0,
        borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 15,
        borderStyle: "solid",
        backgroundColor: "transparent",
        borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "white",
        marginBottom: 10
    },
    mascot: {
        width: 120,
        height: 120,
        marginBottom: 30
    },
    formArea: {
        width: "100%",
        maxWidth: 300,
        gap: 15
    },
    bigInput: {
        backgroundColor: "white",
        borderRadius: 15,
        textAlign: "center",
        fontSize: 22,
        height: 60,
        color: "#333",
        fontWeight: "bold"
    },
    rowGenre: {
        flexDirection: "row",
        gap: 15
    },
    btnOption: {
        flex: 1,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 15,
        alignItems: "center"
    },
    btnOptionActive: {
        backgroundColor: "#0a7ea4"
    },
    txtOption: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333"
    },
    photoBox: {
        height: 150,
        borderWidth: 2,
        borderColor: "white",
        borderStyle: "dashed",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)"
    },
    imgPreview: {
        width: "100%", height: "100%", borderRadius: 18
    },
    btnNext: {
        backgroundColor: "#0a7ea4",
        height: 55,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5
    },
    btnBack: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 18
    },
    txtBtn: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18
    }
});