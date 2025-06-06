<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useEventListener, useVModel } from '@vueuse/core'
import { TooltipProvider } from 'radix-vue'
import { computed, type HTMLAttributes, type Ref, ref } from 'vue'
import { provideSidebarContext, SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_COOKIE_NAME, SIDEBAR_KEYBOARD_SHORTCUT, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './utils'

const props = withDefaults(defineProps<{
  defaultOpen?: boolean
  open?: boolean
  class?: HTMLAttributes['class']
}>(), {
  defaultOpen: true,
  open: undefined,
})

const emits = defineEmits<{
  'update:open': [open: boolean]
}>()

const isMobile = ref(false) // useIsMobile()
const openMobile = ref(false)

const open = useVModel(props, 'open', emits, {
  defaultValue: props.defaultOpen ?? false,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>

function setOpen(value: boolean) {
  open.value = value // emits('update:open', value)
}

function setOpenMobile(value: boolean) {
  openMobile.value = value
}

// Helper to toggle the sidebar.
function toggleSidebar() {
  return isMobile.value ? setOpenMobile(!open.value) : setOpen(!open.value)
}

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    toggleSidebar()
  }
})

// We add a state so that we can do data-state="expanded" or "collapsed".
// This makes it easier to style the sidebar with Tailwind classes.
const state = computed(() => open.value ? 'expanded' : 'collapsed')

provideSidebarContext({
  state,
  open,
  setOpen,
  isMobile,
  openMobile,
  setOpenMobile,
  toggleSidebar,
})
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div
      :style="{
        '--sidebar-width': SIDEBAR_WIDTH,
        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
      }"
      :class="cn('group/sidebar-wrapper flex min-h-svh w-full text-sidebar-foreground has-[[data-variant=inset]]:bg-sidebar', props.class)"
    >
      <slot />
    </div>
  </TooltipProvider>
</template>
