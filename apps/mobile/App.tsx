import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutor Marketplace</Text>
      <Text style={styles.subtitle}>Mobile shell ready.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  subtitle: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center"
  },
  title: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center"
  }
});

