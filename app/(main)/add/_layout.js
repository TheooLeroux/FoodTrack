// app/(main)/add/_layout.js
import { Stack } from "expo-router";

const AddLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerTintColor: "#0a7ea4",
                headerTitleStyle: { fontWeight: "bold" }
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "Nouveau Repas",
                    headerShadowVisible: false
                }}
            />

            <Stack.Screen
                name="camera"
                options={{
                    title: "",
                    headerTransparent: true,
                    headerTintColor: "#FFF",
                    presentation: "fullScreenModal"
                }}
            />
        </Stack>
    );
}

export default AddLayout;