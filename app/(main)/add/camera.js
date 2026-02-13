// app/(main)/add/camera.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ajouterAuPanierGlobal } from "../../../utils/panier";

const Camera = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const [scannedLock, setScannedLock] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={styles.centerView}>
                <Text style={{ textAlign: "center", marginBottom: 10, color: "white" }}>
                    Besoin de la caméra pour scanner !
                </Text>
                <Button onPress={requestPermission} title="Autoriser la caméra" />
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scannedLock) return;
        setScannedLock(true);
        setLoading(true);

        console.log(`Camera : ${data}`);

        try {
            const url = `https://fr.openfoodfacts.org/api/v2/product/${data}.json`;
            const req = await fetch(url, {
                headers: { "User-Agent": "FoodTrackStudent/1.0" }
            });
            const json = await req.json();

            if (json.status === 1 && json.product) {
                console.log(`AJOUT : ${json.product.product_name}`);
                const uniqueId = Date.now().toString() + Math.random().toString(36).slice(2);

                const itemPropre = {
                    id: uniqueId,
                    name: json.product.product_name || json.product.product_name_fr || "Produit sans nom",
                    brand: json.product.brands || "",
                    image_url: json.product.image_url || null,
                    nutriscore: json.product.nutriscore_grade || "",
                    calories: json.product.nutriments?.["energy-kcal_100g"] || 0,
                    proteins: json.product.nutriments?.proteins_100g || 0,
                    carbs: json.product.nutriments?.carbohydrates_100g || 0,
                    fats: json.product.nutriments?.fat_100g || 0,
                };

                ajouterAuPanierGlobal(itemPropre);
                router.back();

            } else {
                Alert.alert("Pas trouvé", "Ce produit n'est pas dans la base.", [
                    { text: "OK", onPress: () => { setScannedLock(false); setLoading(false); } }
                ]);
            }
        } catch (error) {
            console.error("Erreur API:", error);
            Alert.alert("Erreur", "Problème de connexion.");
            setScannedLock(false);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={StyleSheet.absoluteFillObject} facing="back" onBarcodeScanned={scannedLock ? undefined : handleBarCodeScanned} barcodeScannerSettings={{barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"]}}/>

            <View style={styles.overlay}>
                <View style={styles.topZone}>
                    <Text style={styles.txtInstruction}>Vise le code-barres</Text>
                </View>
                <View style={styles.middleZone}>
                    <View style={[styles.square, loading && styles.squareLoading]} />
                </View>
                <View style={styles.bottomZone}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0a7ea4" />
                    ) : (
                        <TouchableOpacity onPress={() => router.back()} style={styles.btnCancel}>
                            <Ionicons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

export default Camera;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    centerView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "space-between",
    },
    topZone: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    txtInstruction: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 40,
    },
    middleZone: {
        height: 250,
        flexDirection: "row",
    },
    square: {
        flex: 1,
        borderColor: "white",
        borderWidth: 2,
        marginHorizontal: 40,
        borderRadius: 20,
    },
    squareLoading: {
        borderColor: "#0a7ea4",
        borderWidth: 4,
    },
    bottomZone: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    btnCancel: {
        backgroundColor: "rgba(255,255,255,0.2)",
        padding: 15,
        borderRadius: 30,
    },
});