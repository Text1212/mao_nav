import { ref, onMounted, onUnmounted } from 'vue'

export function useLazyRender(options = {}) {
  const { rootMargin = '300px', threshold = 0 } = options
  const isVisible = ref(false)
  const targetRef = ref(null)
  let observer = null

  onMounted(() => {
    if (!targetRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible.value = true
          observer.unobserve(entries[0].target)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(targetRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isVisible, targetRef }
}
