import { View, Text, StyleSheet } from "react-native";

export default function Closet() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Closet</Text>
      <Text>Inventory, Combinations & Filters</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
