// app/(main)/(home)/index.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProfile, getHistorique } from "../../../utils/database";
import Tuto from "./Tuto";

const formatDate = (dateStr) => {
    try {
        const options = { weekday: "long", day: "numeric", month: "long" };
        return new Date(dateStr).toLocaleDateString("fr-FR", options);
    } catch (e) {
        return dateStr;
    }
};

const PageAccueil = () => {
    const { user } = useUser();
    const router = useRouter();
    const [besoinTuto, setBesoinTuto] = useState(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const [mesRepas, setMesRepas] = useState([]);
    const [objectifQuotidien, setObjectifQuotidien] = useState(2000);
    const [loadingList, setLoadingList] = useState(false);

    useEffect(() => {
        verifPremierLancement();
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (besoinTuto === false) {
                chargerDonnees();
            }
        }, [besoinTuto])
    );

    const verifPremierLancement = async () => {
        if (!user?.id){
            setLoadingInit(false);
            return;
        }
        try {
            const profil = await getProfile(user.id);
            const isFirst = profil?.first_connection === 1;
            setBesoinTuto(isFirst);

            if (!isFirst) {
                chargerDonnees();
            }
        } catch (e) {
            console.log("Bug verif profil", e);
        } finally {
            setLoadingInit(false);
        }
    };

    const chargerDonnees = async () => {
        setLoadingList(true);
        try {
            const dataRepas = await getHistorique();
            setMesRepas(dataRepas || []);

            if (user?.id) {
                const profil = await getProfile(user.id);
                if (profil && profil.daily_goal) {
                    setObjectifQuotidien(profil.daily_goal);
                }
            }
        } catch (e) {
            console.log("Erreur chargement données", e);
        } finally {
            setLoadingList(false);
        }
    };

    const getCaloriesAujourdhui = () => {
        const dateDuJour = new Date().toISOString().split("T")[0];

        const total = mesRepas
            .filter(r => r.date === dateDuJour)
            .reduce((acc, curr) => acc + (curr.total_calories || 0), 0);

        return Math.round(total);
    };

    if (loadingInit) {
        return (
            <View style={styles.centerLoad}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    if (besoinTuto) {
        return (
            <Tuto userId={user.id} onFinish={() => {setBesoinTuto(false);chargerDonnees();}}/>
        );
    }

    const totalToday = getCaloriesAujourdhui();
    const pourcentage = Math.min((totalToday / objectifQuotidien) * 100, 100);
    const reste = objectifQuotidien - totalToday;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titrePage}>Tes repas du jour</Text>
                <Text style={styles.sousTitre}>Suivi nutritionnel</Text>
            </View>

            <View style={styles.cardResume}>
                <View style={styles.resumeHeader}>
                    <Text style={styles.labelResume}>Aujourd"hui</Text>
                    <Text style={styles.valeurResume}>
                        <Text style={{fontWeight: "900", color: "#0a7ea4"}}>{totalToday}</Text> / {objectifQuotidien} kcal
                    </Text>
                </View>

                <View style={styles.barreFond}>
                    <View style={[styles.barreRemplie, { width: `${pourcentage}%`, backgroundColor: totalToday > objectifQuotidien ? "#FF3B30" : "#0a7ea4" }]} />
                </View>

                <Text style={styles.txtReste}>
                    {reste >= 0
                        ? `Vous avez encore le droit à ${Math.round(reste)} kcal`
                        : `Tu as dépassé ton objectif de ${Math.abs(Math.round(reste))} kcal`}
                </Text>
            </View>

            {loadingList ? (
                <ActivityIndicator style={{ marginTop: 20 }} color="#0a7ea4" />
            ) : mesRepas.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="fast-food-outline" size={60} color="#DDD" />
                    <Text style={styles.txtEmpty}>Aucun repas enregistré.</Text>
                    <Text style={styles.txtEmptySub}>Clique sur "+" pour commencer !</Text>
                </View>
            ) : (
                <FlatList data={mesRepas} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} renderItem={({ item }) => (
                    <TouchableOpacity style={styles.cardRepas} onPress={() => router.push(`/(main)/(home)/${item.id}`)}>
                        <View style={styles.iconBox}>
                            <Ionicons name={item.name.includes("Déj") ? "cafe" : item.name.includes("Dîner") ? "moon" : "restaurant"} size={24} color="#0a7ea4"/>
                        </View>

                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.repasNom}>{item.name}</Text>
                            <Text style={styles.repasDate}>{formatDate(item.date)}</Text>
                        </View>

                        <View style={styles.kcalBadge}>
                            <Text style={styles.kcalVal}>{Math.round(item.total_calories || 0)}</Text>
                            <Text style={styles.kcalUnit}>kcal</Text>
                        </View>

                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                )}/>
            )}

            <TouchableOpacity style={styles.fab} onPress={() => router.push("/(main)/add")}>
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

export default PageAccueil;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    centerLoad: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 10,
        backgroundColor: "#FAFAFA",
    },
    titrePage: {
        fontSize: 28,
        fontWeight: "900",
        color: "#0a7ea4",
    },
    sousTitre: {
        color: "#888",
        marginTop: 5,
        fontSize: 14,
    },
    cardResume: {
        backgroundColor: "#FFF",
        marginHorizontal: 20,
        marginTop: 10,
        padding: 20,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    resumeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    labelResume: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    valeurResume: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    barreFond: {
        height: 12,
        backgroundColor: "#F0F0F0",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 8,
    },
    barreRemplie: {
        height: "100%",
        borderRadius: 6,
    },
    txtReste: {
        fontSize: 12,
        color: "#888",
        fontStyle: "italic",
        textAlign: "right",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
        opacity: 0.8,
    },
    txtEmpty: {
        fontSize: 18,
        color: "#555",
        fontWeight: "bold",
        marginTop: 15,
    },
    txtEmptySub: {
        color: "#999",
        marginTop: 5,
    },
    cardRepas: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        marginHorizontal: 20,
        marginTop: 15,
        padding: 15,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: "#E6F4F9",
        justifyContent: "center",
        alignItems: "center",
    },
    repasNom: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    repasDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    kcalBadge: {
        alignItems: "flex-end",
        marginRight: 10,
        minWidth: 50,
    },
    kcalVal: {
        fontSize: 16,
        fontWeight: "900",
        color: "#0a7ea4",
    },
    kcalUnit: {
        fontSize: 10,
        color: "#0a7ea4",
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#0a7ea4",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0a7ea4",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        elevation: 5,
    },
});