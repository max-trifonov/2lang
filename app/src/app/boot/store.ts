import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBootScreenStore = defineStore('bootScreen', () => {
  const visible = ref(true)
  const startupSettled = ref(false)

  function markStartupSettled(): void {
    startupSettled.value = true
    visible.value = false
  }

  return { visible, startupSettled, markStartupSettled }
})
