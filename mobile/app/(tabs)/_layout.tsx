import { Tabs } from "expo-router";
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View, type ColorValue } from 'react-native';
import { useMemo } from 'react';
import { useAuth } from '../../src/providers/AuthProvider';
import { ThemeColors } from '../../src/theme/tokens';
import { VastreIcon, VastreIconName } from '../../src/components/icons/VastreIcons';
import { useAppTheme } from '../../src/providers/ThemeProvider';

function tabIcon(name: VastreIconName, colors: ThemeColors, iconWell: object) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <View style={[iconWell, focused && { backgroundColor: colors.card }]}>
      <VastreIcon name={name} size={26} color={color} focused={focused} />
    </View>
  );
}

export default function TabLayout() {
  const { session, isLoading } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createTabStyles(colors), [colors]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.taupe,
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarItemStyle: styles.tabBarItem,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: tabIcon('home', colors, styles.iconWell),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: "Closet",
          tabBarLabel: "Closet",
          tabBarIcon: tabIcon('closet', colors, styles.iconWell),
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Style Swipe",
          tabBarLabel: "Swipe",
          tabBarIcon: tabIcon('lookbook', colors, styles.iconWell),
        }}
      />
      <Tabs.Screen
        name="organize"
        options={{
          title: "Organize",
          tabBarLabel: "Organize",
          tabBarIcon: tabIcon('trips', colors, styles.iconWell),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: tabIcon('insights', colors, styles.iconWell),
        }}
      />
    </Tabs>
  );
}

function createTabStyles(colors: ThemeColors) { return StyleSheet.create({
  tabBar: {
    backgroundColor: colors.secondary,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    paddingTop: 5,
    paddingBottom: 5,
  },
  tabBarItem: { minWidth: 0 },
  tabBarLabel: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  iconWell: { alignItems: 'center', borderRadius: 15, height: 31, justifyContent: 'center', width: 48 },
}); }
