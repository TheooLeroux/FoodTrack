import {ClerkProvider} from "@clerk/clerk-expo";
import {Slot} from "expo-router";
import {tokenCache} from "@clerk/clerk-expo/token-cache";

const RootLayout = () => {
    return (
        <ClerkProvider tokenCache={tokenCache}>
            <Slot/>
        </ClerkProvider>
        )
}

export default RootLayout;