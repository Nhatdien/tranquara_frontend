import { computed } from "vue";
import { testCollection } from "~/mock/testCollection";
import { Journal, CreateJournalRequest } from "~/types/user_journal";
import { useChatlogtore } from "#imports";

export const useSlideGroup = () => {
  const route = useRoute()
  const currentCollecton = computed(() =>
    testCollection.collections.find((colleciton) => colleciton.id === route.params.id)
  )
  const activeSlideGroup = computed(() =>
    currentCollecton?.value?.slide_groups.find((slideGroup) => slideGroup.id === route.params.slideGroupId)
  )

  const findSlideGroup = (collectionId: string, slideGroupId: string) => {
    const collection = testCollection.collections.find((colleciton) => colleciton.id === collectionId)

    return collection?.slide_groups.find((slideGroup) => slideGroup.id === slideGroupId)
  }

  const openSlideGroup = (slideGroupId: string, collectionId: string) => {
    navigateTo(`/library/collection/${collectionId}/${slideGroupId}`)
  };

  const closeSlideGroup = () => {
    useChatlogtore().chatlogs = [];
    userJournalStore().currentWritingContent = {} 
    userJournalStore().currentJournal = {} as Journal
    useTiptapEditorStore().editors = []

    useRouter().back()
  };

  const saveJournal = (journal: CreateJournalRequest, slideGroupId?: string,) => {
    if (slideGroupId) {
      console.log("journal saved with slideGroupId: ", slideGroupId);
    } else {
      console.log("journal saved without any slideGroupId: ");
    }
    // userJournalStore().createJournal({
    //   ...journal,
    // });
  };


  return {
    currentCollecton, activeSlideGroup, openSlideGroup, closeSlideGroup, saveJournal, findSlideGroup
  };
};
