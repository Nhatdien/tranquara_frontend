import { computed } from "vue";
import { testCollection } from "~/mock/testCollection";
import { Journal, CreateJournalRequest } from "~/types/user_journal";

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
    userJournalStore().currentJournal = {} as Journal
  };

  const saveJournal = (journal: CreateJournalRequest, templateId?: string,) => {
    if (templateId) {
      console.log("journal saved with template", templateId);
    } else {
      console.log("journal saved without any template");
    }
    userJournalStore().createJournal({
      ...journal,
    });
  };


  return {
    currentCollecton, activeSlideGroup, openSlideGroup, closeSlideGroup, saveJournal, findSlideGroup
  };
};
