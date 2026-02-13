// app/(auth)/_layout.js
import { Stack } from "expo-router";

const AuthLayout = () => {
    return (
        <Stack screenOptions={{headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: "white" }}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}

export default AuthLayout;