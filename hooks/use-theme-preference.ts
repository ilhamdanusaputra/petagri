import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark' | null;

const THEME_PREFERENCE_KEY = 'petagri_theme_preference';

// Global shared state so multiple hook instances stay in sync
let globalUserPreference: ColorScheme = null;
let globalColorScheme: ColorScheme = null;
let isInitialized = false;
const listeners = new Set<(state: { colorScheme: ColorScheme; userPreference: ColorScheme }) => void>();

async function initGlobal(systemColorScheme: ColorScheme) {
  if (isInitialized) return;
  isInitialized = true;
  try {
    const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (saved === 'light' || saved === 'dark') {
      globalUserPreference = saved as ColorScheme;
    }
  } catch (e) {
    console.error('Error loading theme preference:', e);
  }
  globalColorScheme = globalUserPreference ?? systemColorScheme;
  notify();
}

function notify() {
  for (const l of listeners) {
    l({ colorScheme: globalColorScheme, userPreference: globalUserPreference });
  }
}

export function useThemePreference() {
  const systemColorScheme = useNativeColorScheme();
  const [state, setState] = useState<{ colorScheme: ColorScheme; userPreference: ColorScheme }>(() => ({
    colorScheme: globalColorScheme ?? systemColorScheme ?? 'light',
    userPreference: globalUserPreference,
  }));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // initialize global once
    initGlobal(systemColorScheme).then(() => {
      if (!mounted) return;
      setIsLoading(false);
    });

    const listener = (s: { colorScheme: ColorScheme; userPreference: ColorScheme }) => {
      setState(s);
    };
    listeners.add(listener);
    // push current global state to listener
    listener({ colorScheme: globalColorScheme ?? systemColorScheme, userPreference: globalUserPreference });

    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const newScheme: ColorScheme = globalUserPreference
        ? globalUserPreference === 'light'
          ? 'dark'
          : 'light'
        : systemColorScheme === 'light'
        ? 'dark'
        : 'light';

      globalUserPreference = newScheme;
      globalColorScheme = newScheme;
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newScheme as string);
      notify();
    } catch (e) {
      console.error('Error saving theme preference:', e);
    }
  };

  const setTheme = async (scheme: ColorScheme) => {
    try {
      if (scheme === null) {
        globalUserPreference = null;
        globalColorScheme = systemColorScheme;
        await AsyncStorage.removeItem(THEME_PREFERENCE_KEY);
      } else {
        globalUserPreference = scheme;
        globalColorScheme = scheme;
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, scheme);
      }
      notify();
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  };

  return {
    colorScheme: state.colorScheme,
    userPreference: state.userPreference,
    toggleTheme,
    setTheme,
    isLoading,
  };
}
