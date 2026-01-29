import { Node, mergeAttributes } from '@tiptap/core'

export const CustomParagraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [
      {
        tag: 'p',
        getAttrs: node => {
          if (typeof node === 'string') return {}
          const className = (node as HTMLElement).getAttribute('class')
          return { class: className }
        }
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes), 0]
  },
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          return attributes.class ? { class: attributes.class } : {}
        }
      }
    }
  }
})