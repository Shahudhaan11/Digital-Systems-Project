import { Alert, Platform } from "react-native";

// Alert.alert is a no-op on web (react-native-web's implementation does
// nothing), so every confirm/notify dialog needs a web fallback to actually
// show anything there.
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "OK",
  destructive = false,
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}

export function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}
