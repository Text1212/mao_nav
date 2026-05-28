<template>
  <div ref="targetRef" class="lazy-card-wrapper">
    <slot v-if="isVisible" />
    <div v-else class="site-card site-card-skeleton">
      <div class="site-icon skeleton-icon" />
      <div class="site-info">
        <div class="skeleton-line skeleton-name" />
        <div class="skeleton-line skeleton-desc" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLazyRender } from '@/composables/useLazyRender.js'

const { isVisible, targetRef } = useLazyRender()
</script>
