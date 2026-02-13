// app/(main)/(home)/[id].js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getDetailsRepas, supprimerRepas, supprimerAliment } from "../../../utils/database";

const DetailRepas = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [meal, setMeal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalMacros, setTotalMacros] = useState({ k: 0, p: 0, c: 0, f: 0 });

    useEffect(() => {
        initPage();
    }, [id]);

    const initPage = async () => {
        try {
            const repasData = await getDetailsRepas(id);

            if (!repasData) {
                console.warn("Aucun repas trouvé pour cet ID");
                return;
            }

            setMeal(repasData);
            let tmp = { k: 0, p: 0, c: 0, f: 0 };

            if (repasData.foods && repasData.foods.length > 0) {
                for (let i = 0; i < repasData.foods.length; i++) {
                    const f = repasData.foods[i];
                    tmp.k += f.calories || 0;
                    tmp.p += f.proteins || 0;
                    tmp.c += f.carbs || 0;
                    tmp.f += f.fats || 0;
                }
            }
            setTotalMacros(tmp);

        } catch (err) {
            console.error("Bug load details:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEntireMeal = () => {
        Alert.alert("Supprimer ?", "Sûr de vouloir supprimer ce repas ?", [
                {
                    text: "Non",
                    style: "cancel"
                },
                {
                    text: "Oui, supprimer",
                    style: "destructive",
                    onPress: async () => {
                        console.log("Deleting meal", id);
                        await supprimerRepas(id);
                        router.back();
                    }
                }
            ]
        );
    };

    const trashFood = (foodId) => {
        Alert.alert("Retirer ?", "On enlève cet aliment ?", [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Virer",
                    style: "destructive",
                    onPress: async () => {
                        await supprimerAliment(foodId);
                        initPage();
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerLoad}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    if (!meal) {
        return (
            <View style={styles.centerLoad}>
                <Text>Erreur: Repas introuvable</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <View>
                    <Text style={styles.titreRepas}>
                        {meal.name}
                    </Text>

                    <Text style={styles.dateRepas}>
                        {new Date(meal.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </Text>
                </View>

                <TouchableOpacity onPress={deleteEntireMeal} style={styles.btnTrashBig}>
                    <Ionicons name="trash" size={22} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.macrosRow}>
                <View style={[styles.macroCard, { backgroundColor: "#E6F4F9" }]}>
                    <Text style={styles.macroVal}>
                        {Math.round(totalMacros.k)}
                    </Text>
                    <Text style={styles.macroLabel}>
                        Kcal
                    </Text>
                </View>

                <View style={styles.macroCard}>
                    <Text style={[styles.macroVal, {color: "#333"}]}>
                        {Math.round(totalMacros.p)}g
                    </Text>
                    <Text style={styles.macroLabel}>
                        Prot
                    </Text>
                </View>

                <View style={styles.macroCard}>
                    <Text style={[styles.macroVal, {color: "#333"}]}>
                        {Math.round(totalMacros.c)}g
                    </Text>
                    <Text style={styles.macroLabel}>
                        Gluc.
                    </Text>
                </View>

                <View style={styles.macroCard}>
                    <Text style={[styles.macroVal, {color: "#333"}]}>
                        {Math.round(totalMacros.f)}g
                    </Text>
                    <Text style={styles.macroLabel}>
                        Gras
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>
                Aliments ({meal.foods?.length || 0})
            </Text>

            <FlatList data={meal.foods} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ paddingBottom: 50 }} renderItem={({ item }) => (
                <View style={styles.itemFood}>
                    {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.thumb} resizeMode="contain"/>
                    ) : (
                        <View style={[styles.thumb, { backgroundColor: "#EEE", justifyContent: "center", alignItems: "center" }]}>
                            <Ionicons name="fast-food" size={20} color="#CCC" />
                        </View>
                    )}

                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.foodName} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text style={styles.foodBrand}>
                            {item.brand}
                        </Text>
                    </View>

                    <View style={{ alignItems: "flex-end", marginRight: 10 }}>
                        <Text style={styles.foodKcal}>
                            {Math.round(item.calories)}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#999" }}>
                            kcal
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => trashFood(item.id)} style={{padding:5}}>
                        <Ionicons name="close-circle" size={24} color="#CCC" />
                    </TouchableOpacity>
                </View>
            )}
            />
        </View>
    );
}

export default DetailRepas;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        padding: 20
    },
    centerLoad: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    headerBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20
    },
    titreRepas: {
        fontSize: 26,
        fontWeight: "900",
        color: "#0a7ea4",
        textTransform: "capitalize"
    },
    dateRepas: {
        fontSize: 14,
        color: "#888",
        marginTop: 4
    },
    btnTrashBig: {
        padding: 10,
        backgroundColor: "#FFF0F0",
        borderRadius: 12
    },
    macrosRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
        gap: 10
    },
    macroCard: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 10,
        borderRadius: 12,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    macroVal: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0a7ea4"
    },
    macroLabel: {
        fontSize: 12,
        color: "#999",
        marginTop: 2
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10
    },
    itemFood: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1
    },
    thumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#FFF"
    },
    foodName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333"
    },
    foodBrand: {
        fontSize: 12,
        color: "#999"
    },
    foodKcal: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#555"
    }
});