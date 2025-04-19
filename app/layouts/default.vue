<template>
  <div>
    <AppHeader />
    
    <!-- 로그인 상태 확인 -->
    <div class="bg-gray-100 border-b">
      <UserStatus />
    </div>

    <UMain>
      <slot />
    </UMain>

    <AppFooter />
  </div>
</template>
