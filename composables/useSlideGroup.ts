import { computed } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";
import { Journal, CreateJournalRequest, SlideGroup } from "~/types/user_journal";

export const useSlideGroup = (props?: { collectionId?: string, slideGroupId?: string }) => {
  const route = useRoute()
  const store = userJournalStore();

  const collectionId = computed(() => props?.collectionId || route.params.id as string);
  const slideGroupId = computed(() => props?.slideGroupId || route.params.slideGroupId as string);

  const currentCollecton = computed(() =>
    store.templates.find((template) => template.id === collectionId.value)
  )

  const activeSlideGroup = computed(() => {
    if (!currentCollecton.value) return undefined;
    
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
    if (slideGroupId.value) {
      return groups.find((group) => group.id === slideGroupId.value);
    }
    
    // Default to first group if no ID text (common for modals)
    return groups[0];
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

    return groups.find((group) => group.id === slideGroupId)
  }

  const openSlideGroup = (slideGroupId: string, collectionId: string) => {
    navigateTo(`/learn_and_prepare/collection/${collectionId}/${slideGroupId}`)
  };

  const closeSlideGroup = () => {
    useChatlogtore().chatlogs = [];
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


  return {
    currentCollecton, activeSlideGroup, openSlideGroup, closeSlideGroup, saveJournal, findSlideGroup
  };
};
