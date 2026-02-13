import { Stack } from "expo-router";


const HomeLayout = () => {
    return (
        <Stack screenOptions={{headerTintColor: "#0a7ea4", headerTitleStyle: { fontWeight: "bold", color: "#333" }, headerStyle: { backgroundColor: "#FAFAFA" }}}>
            <Stack.Screen name="index" options={{headerShown: false}}/>

            <Stack.Screen name="[id]" options={{title: "Détails du repas", presentation: "card"}}/>
        </Stack>
    );
}

export default HomeLayout;