import {useAuth} from "@clerk/clerk-expo";
import {Redirect, Slot, Stack} from "expo-router";

export default function AuthRoutesLayout() {
    const {isSignedIn} = useAuth();
    if (!isSignedIn){
        return <Redirect href={"/sign-in"} />
    }else{
        return (
            <Stack>
                <Stack.Screen name="index" options={{title:"Home"}}/>
            </Stack>
        )
    }
};