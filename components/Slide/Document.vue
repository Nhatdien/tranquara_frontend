<template>
    <div>
        <h2 class="mb-2">{{ content?.title || content?.header }}</h2>
        <p v-html="content?.content || content?.body"></p>
    </div>

</template>

<script lang="ts" setup>
const props = defineProps(
    {
        content: {
            type: Object,
            required: true
        }
    }
)


</script>