<script setup lang="ts">
import { useSupabase } from '~/utils/supabase'

const route = useRoute()
const supabase = useSupabase()
const user = ref(null)
const loading = ref(true)
const error = ref(null)

// 드롭다운 메뉴 열림 상태
const isDropdownOpen = ref(false)

// 현재 인증된 사용자 정보 가져오기
async function fetchUser() {
  try {
    loading.value = true
    const { data, error: err } = await supabase.auth.getUser()
    
    if (err) throw err
    
    user.value = data.user
  } catch (err) {
    console.error('사용자 정보 로드 오류:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    loading.value = true
    const { error: err } = await supabase.auth.signOut()
    
    if (err) throw err
    
    // 로그아웃 후 페이지 새로고침
    window.location.href = '/login'
  } catch (err) {
    console.error('로그아웃 오류:', err)
    error.value = err
  } finally {
    loading.value = false
    isDropdownOpen.value = false
  }
}

// 컴포넌트 마운트 시 사용자 정보 로드
onMounted(() => {
  fetchUser()
  
  // 인증 상태 변경 이벤트 리스너
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('인증 상태 변경:', event, session)
      fetchUser()
    }
  )
  
  // 컴포넌트 언마운트 시 리스너 제거
  onUnmounted(() => {
    if (authListener) authListener.subscription.unsubscribe()
  })
})

const items = computed(() => [{
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs')
}, {
  label: 'Pricing',
  to: '/pricing'
}, {
  label: 'Blog',
  to: '/blog'
}])

// 드롭다운 메뉴 토글
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 바깥 영역 클릭 시 드롭다운 닫기
function closeDropdown() {
  isDropdownOpen.value = false
}
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <LogoPro class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <!-- 로그인 상태에 따라 다른 UI 표시 -->
      <template v-if="loading">
        <UButton
          color="neutral"
          variant="ghost"
          class="lg:inline-flex"
        >
          <USpinner size="xs" class="mr-1 -ml-1" />
          로딩 중...
        </UButton>
      </template>

      <template v-else-if="user">
        <!-- 모바일 화면 -->
        <UButton
          icon="i-lucide-user"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          @click="toggleDropdown"
        />

        <!-- 데스크톱 화면 -->
        <div class="relative hidden lg:block">
          <UButton
            color="neutral"
            variant="ghost"
            class="flex items-center gap-2"
            @click="toggleDropdown"
          >
            <UAvatar
              :src="user.user_metadata?.avatar_url"
              :alt="user.user_metadata?.name || user.email"
              size="xs"
            />
            <span class="max-w-[120px] truncate">{{ user.email }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
          </UButton>

          <!-- 드롭다운 메뉴 -->
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
            v-click-outside="closeDropdown"
          >
            <div class="p-3 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="user.user_metadata?.avatar_url"
                  :alt="user.user_metadata?.name || user.email"
                  size="sm"
                />
                <div>
                  <div class="font-medium">{{ user.user_metadata?.name || '사용자' }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ user.email }}</div>
                </div>
              </div>
            </div>
            <div class="p-2">
              <UButton
                to="/profile"
                variant="ghost"
                color="neutral"
                block
                class="justify-start mb-1"
                icon="i-lucide-user"
              >
                내 정보
              </UButton>
              <UButton
                variant="ghost"
                color="red"
                block
                class="justify-start"
                icon="i-lucide-log-out"
                @click="handleLogout"
              >
                로그아웃
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <!-- 비로그인 상태 - 모바일 -->
        <UButton
          icon="i-lucide-log-in"
          color="neutral"
          variant="ghost"
          to="/login"
          class="lg:hidden"
        />

        <!-- 비로그인 상태 - 데스크톱 -->
        <UButton
          label="Sign in"
          color="neutral"
          variant="ghost"
          to="/login"
          class="hidden lg:inline-flex"
        />

        <UButton
          label="Sign up"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          class="hidden lg:inline-flex"
          to="/signup"
        />
      </template>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <!-- 모바일 메뉴에서도 로그인 상태에 따라 다른 UI 표시 -->
      <template v-if="user">
        <div class="flex items-center gap-3 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
          <UAvatar
            :src="user.user_metadata?.avatar_url"
            :alt="user.user_metadata?.name || user.email"
            size="sm"
          />
          <div>
            <div class="font-medium">{{ user.user_metadata?.name || '사용자' }}</div>
            <div class="text-xs text-gray-500 truncate">{{ user.email }}</div>
          </div>
        </div>
        <UButton
          to="/profile"
          color="neutral"
          variant="subtle"
          icon="i-lucide-user"
          block
          class="mb-3"
        >
          내 정보
        </UButton>
        <UButton
          color="red"
          icon="i-lucide-log-out"
          block
          @click="handleLogout"
        >
          로그아웃
        </UButton>
      </template>
      <template v-else>
        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          label="Sign up"
          color="neutral"
          to="/signup"
          block
        />
      </template>
    </template>
  </UHeader>
</template>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
