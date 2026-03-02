/**
 * useAIGuard — Composable for AI feature gating
 *
 * Checks whether AI features are enabled in settings.
 * When disabled, shows a toast message directing the user to Settings.
 * Also provides the user's "Your Story" context for AI requests.
 */

import { useSettingsStore } from '~/stores/stores/settings_store';

export function useAIGuard() {
  const settingsStore = useSettingsStore();
  const toast = useToast();

  /** Whether AI features are currently enabled */
  const isAIEnabled = computed(() => settingsStore.aiEnabled);

  /** The user's personal story context (empty string if none) */
  const yourStory = computed(() => settingsStore.yourStory);

  /**
   * Check if AI is enabled. If not, show a toast and return false.
   * Use this as a guard before any AI call:
   *
   * ```ts
   * const { canUseAI, yourStory } = useAIGuard();
   * if (!canUseAI()) return;
   * ```
   */
  const canUseAI = (): boolean => {
    if (!settingsStore.aiEnabled) {
      toast.add({
        title: 'AI features are disabled',
        description: 'Enable AI Personalization in Settings to use this feature.',
        icon: 'i-lucide-sparkles',
        color: 'warning',
      });
      return false;
    }
    return true;
  };

  return {
    isAIEnabled,
    yourStory,
    canUseAI,
  };
}
