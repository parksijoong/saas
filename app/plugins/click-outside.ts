// click-outside.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el, binding) {
      el._clickOutside = (event: MouseEvent) => {
        // 클릭된 요소가 el 또는 그 자식이 아니면 핸들러 호출
        if (!(el === event.target || el.contains(event.target as Node))) {
          binding.value(event)
        }
      }
      document.addEventListener('click', el._clickOutside, true)
    },
    beforeUnmount(el) {
      document.removeEventListener('click', el._clickOutside, true)
    }
  })
}) 