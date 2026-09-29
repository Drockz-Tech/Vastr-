import { View, Text, StyleSheet } from "react-native";

export default function Swipe() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Style Swipe</Text>
      <Text>Swipe left/right on past outfits</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
