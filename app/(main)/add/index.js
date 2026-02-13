// app/(main)/add/index.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Keyboard, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ajouterRepas, ajouterAliment } from "../../../utils/database";
import { getPanier, ajouterAuPanierGlobal, retirerDuPanierGlobal, viderPanierGlobal } from "../../../utils/panier";

const AjouterRepas = () => {
    const router = useRouter();
    const [typeRepas, setTypeRepas] = useState("Petit-déjeuner");
    const [recherche, setRecherche] = useState("");
    const [resultats, setResultats] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [monAssiette, setMonAssiette] = useState(getPanier());
    const timeoutRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            setMonAssiette([...getPanier()]);
        }, [])
    );

    useEffect(() => {
        if (recherche.length > 2) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setChargement(true);
            timeoutRef.current = setTimeout(() => {
                lancerRechercheAPI(recherche);
            }, 500);
        } else {
            setResultats([]);
            setChargement(false);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [recherche]);

    const lancerRechercheAPI = async (texte) => {
        try {
            const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${texte}&search_simple=1&action=process&json=1&page_size=20`;
            const response = await fetch(url, { headers: { "User-Agent": "FoodTrackStudent/1.0" } });
            const data = await response.json();
            setResultats(data.products || []);
        } catch (e) {
            console.log("Erreur API:", e);
        } finally {
            setChargement(false);
        }
    };

    const ajouterDepuisRecherche = (item) => {
        const uniqueId = Date.now().toString() + Math.random().toString(36).slice(2);

        const itemPropre = {
            id: uniqueId,
            name: item.product_name || item.product_name_fr || "Produit sans nom",
            brand: item.brands || "Marque inconnue",
            image_url: item.image_url || null,
            nutriscore: item.nutriscore_grade || "",
            calories: item.nutriments?.["energy-kcal_100g"] || 0,
            proteins: item.nutriments?.proteins_100g || 0,
            carbs: item.nutriments?.carbohydrates_100g || 0,
            fats: item.nutriments?.fat_100g || 0,
        };

        ajouterAuPanierGlobal(itemPropre);
        setMonAssiette([...getPanier()]);
        setRecherche("");
        setResultats([]);
        Keyboard.dismiss();
    };

    const retirerDuPanier = (index) => {
        retirerDuPanierGlobal(index);
        setMonAssiette([...getPanier()]);
    };

    const validerLeRepas = async () => {
        if (monAssiette.length === 0) {
            Alert.alert("Assiette vide", "Ajoute au moins un aliment !");
            return;
        }

        const dateDuJour = new Date().toISOString().split("T")[0];
        const idRepasDB = await ajouterRepas(typeRepas, dateDuJour);

        if (!idRepasDB) {
            Alert.alert("Erreur", "Impossible de créer le repas en base.");
            return;
        }

        console.log("Repas créé en BDD :", idRepasDB);

        for (const aliment of monAssiette) {
            await ajouterAliment({
                ...aliment,
                meal_id: idRepasDB
            });
        }

        Alert.alert("Succès", "Repas enregistré !");
        viderPanierGlobal();
        setMonAssiette([]);
        router.replace("/(main)/(home)");
    };

    return (
        <View style={styles.container}>
            <View style={styles.typesRow}>
                {["Petit-déjeuner", "Déjeuner", "Dîner", "Snack"].map((type) => (
                    <TouchableOpacity key={type} style={[styles.btnType, typeRepas === type && styles.btnTypeActif]} onPress={() => setTypeRepas(type)}>
                        <Text style={[styles.txtType, typeRepas === type && styles.txtTypeActif]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.searchBlock}>
                <View style={styles.inputWrapper}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput style={styles.input} placeholder="Pomme, Pâtes..." value={recherche} onChangeText={setRecherche}/>
                    {chargement && <ActivityIndicator size="small" color="#0a7ea4" />}
                </View>

                <TouchableOpacity style={styles.btnScan} onPress={() => router.push("/add/camera")}>
                    <Ionicons name="barcode-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {resultats.length > 0 && (
                <View style={styles.resultsList}>
                    <FlatList data={resultats} keyExtractor={(item, index) => item.code + index} keyboardShouldPersistTaps="handled" renderItem={({ item }) => (
                            <TouchableOpacity style={styles.itemResult} onPress={() => ajouterDepuisRecherche(item)}>
                                <Image source={{ uri: item.image_url }} style={styles.tinyImg} resizeMode="contain" />
                                <View style={{flex: 1}}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
                                    <Text style={styles.itemBrand}>{item.brands}</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color="#0a7ea4" />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            <View style={styles.panierZone}>
                <Text style={styles.titrePanier}>Mon Assiette ({monAssiette.length})</Text>
                {monAssiette.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.txtEmpty}>Vide pour le moment.</Text>
                    </View>
                ) : (
                    <FlatList data={monAssiette} keyExtractor={(item, index) => index.toString()} renderItem={({ item, index }) => (
                            <View style={styles.itemPanier}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.panierName}>{item.name}</Text>
                                    <Text style={{fontSize: 10, color:"gray"}}>{item.brand}</Text>
                                </View>
                                <Text style={styles.panierKcal}>{Math.round(item.calories)} kcal</Text>
                                <TouchableOpacity onPress={() => retirerDuPanier(index)}>
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
            </View>

            <TouchableOpacity style={[styles.btnValider, monAssiette.length === 0 && styles.btnDisabled]} onPress={validerLeRepas} disabled={monAssiette.length === 0}>
                <Text style={styles.txtValider}>Valider</Text>
            </TouchableOpacity>
        </View>
    );
}

export default AjouterRepas;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        padding: 20,
    },
    typesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    btnType: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: "#EEE",
    },
    btnTypeActif: {
        backgroundColor: "#0a7ea4",
    },
    txtType: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    txtTypeActif: {
        color: "#FFF",
    },
    searchBlock: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
        zIndex: 10,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 50,
        borderWidth: 1,
        borderColor: "#DDD",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        height: "100%",
    },
    btnScan: {
        width: 50,
        height: 50,
        backgroundColor: "#333",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    resultsList: {
        position: "absolute",
        top: 120,
        left: 20,
        right: 20,
        backgroundColor: "#FFF",
        borderRadius: 12,
        maxHeight: 250,
        zIndex: 99,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    itemResult: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        gap: 10,
    },
    tinyImg: {
        width: 40,
        height: 40,
        backgroundColor: "#EEE",
        borderRadius: 5,
    },
    itemName: {
        fontWeight: "600",
        color: "#333",
    },
    itemBrand: {
        fontSize: 12,
        color: "#888",
    },
    panierZone: {
        flex: 1,
        marginTop: 10,
    },
    titrePanier: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0a7ea4",
        marginBottom: 10,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.5,
    },
    txtEmpty: {
        fontStyle: "italic",
    },
    itemPanier: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 8,
    },
    panierName: {
        flex: 1,
        fontWeight: "600",
    },
    panierKcal: {
        fontWeight: "bold",
        color: "#666",
        marginRight: 15,
    },
    btnValider: {
        backgroundColor: "#0a7ea4",
        height: 55,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    btnDisabled: {
        backgroundColor: "#CCC",
    },
    txtValider: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});