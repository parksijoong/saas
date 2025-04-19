<script setup lang="ts">
import { useSupabase } from '~/utils/supabase'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const supabase = useSupabase()
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    console.log('Auth callback page loaded')
    console.log('Route query params:', route.query)
    
    // URL 파라미터에서 인증 정보 추출
    const { data, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }
    
    console.log('Session data:', data)
    
    // 인증 성공 메시지
    toast.add({
      title: '로그인 성공',
      description: '성공적으로 로그인되었습니다.',
      color: 'success'
    })
    
    // 메인 페이지로 리디렉션
    router.push('/')
  } catch (err: any) {
    console.error('Auth callback error:', err)
    error.value = err
    
    toast.add({
      title: '인증 오류',
      description: err.message || '인증 처리 중 오류가 발생했습니다.',
      color: 'error'
    })
    
    // 로그인 페이지로 리디렉션
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <template v-if="loading">
      <div class="text-center">
        <USpinner class="w-12 h-12 mx-auto" />
        <p class="mt-4 text-lg font-medium">인증 처리 중입니다...</p>
        <p class="mt-2 text-sm text-gray-500">잠시만 기다려주세요</p>
      </div>
    </template>
    <template v-else-if="error">
      <div class="text-center max-w-md">
        <div class="text-red-500 text-5xl mb-4">
          <UIcon name="i-lucide-alert-circle" />
        </div>
        <h3 class="text-xl font-bold mb-2">인증 처리 중 오류가 발생했습니다</h3>
        <p class="text-gray-500 mb-4">{{ error.message || '알 수 없는 오류가 발생했습니다' }}</p>
        <p class="text-sm">로그인 페이지로 이동합니다...</p>
      </div>
    </template>
    <template v-else>
      <div class="text-center max-w-md">
        <div class="text-green-500 text-5xl mb-4">
          <UIcon name="i-lucide-check-circle" />
        </div>
        <h3 class="text-xl font-bold mb-2">인증 성공!</h3>
        <p class="text-gray-500 mb-2">성공적으로 로그인되었습니다</p>
        <p class="text-sm">메인 페이지로 이동합니다...</p>
      </div>
    </template>
  </div>
</template> 