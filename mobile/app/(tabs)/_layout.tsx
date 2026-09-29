import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "black", headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: "Closet",
          tabBarLabel: "Closet",
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Style Swipe",
          tabBarLabel: "Swipe",
        }}
      />
      <Tabs.Screen
        name="organize"
        options={{
          title: "Organize",
          tabBarLabel: "Organize",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}
