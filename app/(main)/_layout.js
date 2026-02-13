// app/(main)/_layout.js
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";



const MainLayout = () => {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#0a7ea4",
            tabBarInactiveTintColor: "#999",
            tabBarStyle: {
                borderTopWidth: 0,
                height: 65,
                paddingBottom: 10,
                paddingTop: 5,
                backgroundColor: "#FFF",
                elevation: 0,
                shadowOpacity: 0,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }
        }}>
            <Tabs.Screen name="(home)" options={{title: "Journal", tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
                ),
            }}/>
            <Tabs.Screen name="add" options={{title: "Ajouter", tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={28} color={color} />
                ),
            }}/>
            <Tabs.Screen name="profile" options={{title: "Moi", tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                ),
            }}/>
        </Tabs>
    );
}

export default MainLayout;