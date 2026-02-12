import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import {useAuth, useUser} from "@clerk/clerk-expo";

export default function Page() {

    const {signOut} = useAuth();
    const {user} = useUser();


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Noot Noot</Text>
            <Text style={styles.title}>
                {user?.primaryEmailAddress?.emailAddress}
            </Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "#fff",
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignSelf:"centerr"
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "center",
    }
});