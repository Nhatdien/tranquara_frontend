<template>

    <section class="quote-card flex flex-col items-center gap-4 ">
        <Quote class="quote-icon" fill="amber"></Quote>
        Remember, every breath is a fresh start.
    </section>

</template>

<script lang="ts" setup>
import { Quote } from 'lucide-vue-next';


</script>

<style lang="scss">
.quote-card {
    position: relative;
    border: 1px solid var(--color-old-neutral-700);
    box-shadow: 1px 1px 0.5rem 0.1rem var(--color-old-neutral-700);
    padding: 1rem;
    text-align: center;
    border-radius: 0.375rem;

    .quote-icon {
        top: -0.5rem;
        left: -0.5rem;
        width: 2rem;
        height: 2rem;
        fill: #F2B900;
        border: unset;
        stroke-width: 0px;
    }
}

</style>