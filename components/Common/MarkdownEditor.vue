<template>
  <section v-if="editor">
    <editor-content
      class="min-h-[40vh] max-h-[400px] rounded-2xl"
      :editor="editor" />
    <!-- <div class="border border-gray-400 p-4 overflow-x-scroll">
      <div class="button-group flex gap-x-2 max-w-[80vw]">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }">
          <Bold/>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }">
          <Italic/>
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }">
          <Strikethrough/>
        </button>

        <button @click="editor.chain().focus().clearNodes().run()">
         <RemoveFormatting/>
        </button>
        <button
          @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }">
          <Pilcrow/>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
          <Heading1 />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
          <Heading2 />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
          <Heading3 />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
          <Heading4 />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
          <Heading5 />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
          <Heading6 />
        </button>
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }">
          <List />
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }">
          <ListOrdered />
        </button>
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }">
          <Quote />
        </button>

        <button
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()">
          <Undo />
        </button>
        <button
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()">
          <Redo />
        </button>
      </div>
    </div> -->
  </section>
</template>

<script setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import { CustomParagraph } from "@/components/TiptapExtensions/CustomParagraph";

import {
  Strikethrough,
  RemoveFormatting,
  Pilcrow,
  Bold,
  Italic,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  Undo,
  Redo,
} from "lucide-vue-next";

const modelValue = defineModel();
const emits = defineEmits(["onUpdate"]);
const editor = useEditor({
  editorProps: {
    attributes: {},
    transformPastedText(text) {
      return text.toUpperCase();
    },
  },
  content: modelValue.value || "",
  extensions: [StarterKit, CustomParagraph],
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML();
    emits("onUpdate");
  },
});

defineExpose({ editor });

onMounted(() => {
  console.log(editor.value.content);
});
</script>
<style scoped lang="scss">
button {
  border-radius: 0.75rem;
  padding: 0.25rem;
  font-size: 0.875rem;
}


.is-active {
  background-color: gray;
}
</style>
