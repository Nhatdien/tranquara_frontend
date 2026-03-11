import { computed } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { Journal, CreateJournalRequest, SlideGroup, SlideData } from "~/types/user_journal";

/**
 * Get localized value for a field. If the current locale is Vietnamese
 * and a `_vi` variant exists, use it. Otherwise fall back to the default.
 */
function getLocalizedField(obj: any, field: string, locale: string): string | undefined {
  if (locale === 'vi') {
    const viValue = obj[`${field}_vi`];
    if (viValue) return viValue;
  }
  return obj[field];
}

/**
 * Return a localized copy of slides, replacing question/title/content
 * with their Vietnamese counterparts when available and locale is 'vi'.
 */
function localizeSlides(slides: SlideData[], locale: string): SlideData[] {
  if (locale !== 'vi') return slides;
  return slides.map(slide => ({
    ...slide,
    question: getLocalizedField(slide, 'question', locale) || slide.question,
    title: getLocalizedField(slide, 'title', locale) || slide.title,
    content: getLocalizedField(slide, 'content', locale) || slide.content,
  }));
}

/**
 * Return a localized copy of a SlideGroup, applying locale to
 * group-level title/description and all child slides.
 */
function localizeSlideGroup(group: SlideGroup, locale: string): SlideGroup {
  if (locale !== 'vi') return group;
  return {
    ...group,
    title: getLocalizedField(group, 'title', locale) || group.title,
    description: getLocalizedField(group, 'description', locale) || group.description,
    slides: localizeSlides(group.slides, locale),
  };
}

export const useSlideGroup = (props?: { 
  collectionId?: string, 
  slideGroupId?: string,
  staticSlideGroup?: SlideGroup,
  staticCollectionTitle?: string,
}) => {
  const route = useRoute()
  const store = userJournalStore();
  const { locale } = useI18n();

  const collectionId = computed(() => props?.collectionId || route.params.id as string);
  const slideGroupId = computed(() => props?.slideGroupId || route.params.slideGroupId as string);

  const currentCollecton = computed(() => {
    // Static mode: return a synthetic collection
    if (props?.staticSlideGroup) {
      return {
        id: 'static',
        title: props.staticCollectionTitle || props.staticSlideGroup.title,
        description: props.staticSlideGroup.description,
        category: 'toolkit',
        type: 'journal' as const,
        slide_groups: [props.staticSlideGroup],
        is_active: true,
        created_at: '',
        updated_at: '',
      };
    }

    const template = store.templates.find((template) => template.id === collectionId.value);
    if (!template) return undefined;
    // Apply locale to template-level title/description
    const lang = locale.value;
    if (lang === 'vi') {
      return {
        ...template,
        title: (template as any).title_vi || template.title,
        description: (template as any).description_vi || template.description,
      };
    }
    return template;
  })

  const activeSlideGroup = computed(() => {
    // Static mode: return the provided slide group directly (with locale)
    if (props?.staticSlideGroup) {
      return localizeSlideGroup(props.staticSlideGroup, locale.value);
    }

    if (!currentCollecton.value) return undefined;
    const lang = locale.value;
    
    // Check if we need to parse slide_groups if coming from sqlite as string
    let groups: SlideGroup[] = [];
    if (typeof currentCollecton.value.slide_groups === 'string') {
      try {
        groups = JSON.parse(currentCollecton.value.slide_groups);
      } catch (e) {
        console.error("Error parsing slide_groups:", e);
        groups = [];
      }
    } else {
      groups = currentCollecton.value.slide_groups || [];
    }

    // If specific slide group ID is provided, find it
    let group: SlideGroup | undefined;
    if (slideGroupId.value) {
      group = groups.find((group) => group.id === slideGroupId.value);
    } else {
      // Default to first group if no ID (common for modals)
      group = groups[0];
    }
    
    return group ? localizeSlideGroup(group, lang) : undefined;
  })

  const findSlideGroup = (collectionId: string, slideGroupId: string) => {
    const collection = store.templates.find((template) => template.id === collectionId)
    if (!collection) return undefined;

    let groups: SlideGroup[] = [];
    if (typeof collection.slide_groups === 'string') {
      try {
         groups = JSON.parse(collection.slide_groups);
      } catch (e) {
         groups = [];
      }
    } else {
      groups = collection.slide_groups || [];
    }

    const group = groups.find((group) => group.id === slideGroupId);
    return group ? localizeSlideGroup(group, locale.value) : undefined;
  }

  const openSlideGroup = (slideGroupId: string, collectionId: string) => {
    const base = route.path.startsWith('/toolkit/journey')
      ? '/toolkit/journey'
      : '/learn_and_prepare/collection';
    navigateTo(`${base}/${collectionId}/${slideGroupId}`);
  };

  const closeSlideGroup = () => {
    userJournalStore().currentWritingContent = {} 
    userJournalStore().currentJournal = null
    useTiptapEditorStore().editors = []

    useRouter().back()
  };

  const saveJournal = async (journal: CreateJournalRequest, slideGroupId?: string | null) => {
    try {
      console.log("[saveJournal] Saving journal:", journal, "slideGroupId:", slideGroupId);
      
      // Ensure database is initialized before saving
      if (!store.isInitialized) {
        console.log("[saveJournal] Database not initialized, initializing...");
        await store.initializeDatabase();
      }
      
      const newJournal = await userJournalStore().createJournal({
        collection_id: slideGroupId,
        title: journal.title,
        content: journal.content,
        content_html: journal.content_html,
        mood_score: journal.mood_score || 0,
        mood_label: journal.mood_label || "neutral"
      });

      console.log("[saveJournal] Journal saved:", newJournal.id);
      return newJournal;
    } catch (error) {
      console.error("[saveJournal] Error saving journal:", error);
      throw error;
    }
  };

  /**
   * Mark the current slide group as completed for learn-type collections.
   * Should be called when the user finishes the last slide in a slide group.
   */
  const markSlideGroupCompleted = async () => {
    if (!currentCollecton.value || !slideGroupId.value) return;

    // Only track progress for learn-type and prepare-type collections
    if (currentCollecton.value.type !== 'learn' && currentCollecton.value.type !== 'prepare') return;

    const learnedStore = useLearnedStore();
    await learnedStore.markCompleted(collectionId.value, slideGroupId.value);
    console.log("[useSlideGroup] Marked slide group as completed:", slideGroupId.value);
  };


  return {
    currentCollecton, activeSlideGroup, openSlideGroup, closeSlideGroup, saveJournal, findSlideGroup, markSlideGroupCompleted
  };
};
