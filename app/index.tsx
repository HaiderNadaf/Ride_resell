import { Redirect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function Index() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return isSignedIn ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/sign-in" />
  );
}
