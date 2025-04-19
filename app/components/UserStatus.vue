<script setup lang="ts">
import { useSupabase } from '~/utils/supabase'

const supabase = useSupabase()
const user = ref(null)
const loading = ref(true)
const error = ref(null)

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
</script>

<template>
  <div class="user-status">
    <UContainer>
      <div v-if="loading" class="flex items-center py-2">
        <USpinner size="sm" class="mr-2" />
        <span>로딩 중...</span>
      </div>
      
      <div v-else-if="user" class="flex items-center justify-between py-2">
        <div class="flex items-center">
          <UAvatar
            :src="user.user_metadata?.avatar_url"
            :alt="user.user_metadata?.name || user.email"
            size="sm"
            class="mr-2"
          />
          <div>
            <div class="font-medium">{{ user.user_metadata?.name || user.email }}</div>
            <div class="text-xs text-gray-500">{{ user.email }}</div>
          </div>
        </div>
        
        <UButton
          color="red"
          variant="ghost"
          icon="i-lucide-log-out"
          size="sm"
          @click="handleLogout"
        >
          로그아웃
        </UButton>
      </div>
      
      <div v-else class="flex justify-between items-center py-2">
        <span>로그인되지 않음</span>
        <UButton
          to="/login"
          color="primary"
          size="sm"
        >
          로그인
        </UButton>
      </div>
    </UContainer>
  </div>
</template> 