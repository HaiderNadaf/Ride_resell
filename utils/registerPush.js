import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerForPushToken() {
  if (!Device.isDevice) {
    alert("Use a physical phone");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (finalStatus !== "granted") {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== "granted") {
    alert("Permission denied");
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log("✅ PUSH TOKEN:", token);
  return token;
}
