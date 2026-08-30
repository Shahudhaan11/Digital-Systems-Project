import { SUPABASE_KEY, SUPABASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const isWeb = Platform.OS === "web";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // On the phone, persist the session with AsyncStorage.
    // On web/server rendering there's no window, so skip storage entirely.
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: !isWeb,
    persistSession: !isWeb,
    // Needed on web so the password-reset link's token in the URL turns
    // into a real (recovery) session automatically.
    detectSessionInUrl: isWeb,
  },
});
