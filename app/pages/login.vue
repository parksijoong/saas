<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useSupabase } from '~/utils/supabase'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: '로그인'
})

const toast = useToast()
const router = useRouter()
const loading = ref(false)
const supabase = useSupabase()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: '이메일',
  placeholder: '이메일 주소를 입력하세요',
  required: true
}, {
  name: 'password',
  label: '비밀번호',
  type: 'password' as const,
  placeholder: '비밀번호를 입력하세요'
}, {
  name: 'remember',
  label: '로그인 유지',
  type: 'checkbox' as const
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: async () => {
    try {
      loading.value = true
      const origin = window.location.origin
      console.log('Current origin:', origin)
      
      // 제공자 상태 확인
      try {
        const { data, error } = await supabase.auth.getSession()
        console.log('Current session:', data)
      } catch (e) {
        console.error('Session check error:', e)
      }
      
      // 명시적 리디렉션 모드 사용
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'consent'  // 항상 권한 동의 화면 표시
          }
        }
      })
      
      if (error) {
        console.error('Google OAuth error:', error)
        throw error
      }
      
      if (data?.url) {
        console.log('Auth URL:', data.url)
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.add({
        title: '오류 발생',
        description: error.message || '소셜 로그인 중 오류가 발생했습니다.',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: async () => {
    try {
      loading.value = true
      const origin = window.location.origin
      console.log('Current origin:', origin)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        console.error('GitHub OAuth error:', error)
        throw error
      }
      
      if (data?.url) {
        console.log('Auth URL:', data.url)
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.add({
        title: '오류 발생',
        description: error.message || '소셜 로그인 중 오류가 발생했습니다.',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }
}]

const schema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    console.log('로그인 시도:', payload.data.email)
    
    // Supabase 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.data.email,
      password: payload.data.password
    })
    
    if (error) {
      console.error('로그인 오류:', error)
      throw error
    }
    
    console.log('로그인 성공:', data)
    
    // 성공 메시지 표시
    toast.add({
      title: '로그인 성공',
      description: '환영합니다! 성공적으로 로그인되었습니다.',
      color: 'success'
    })
    
    // 메인 페이지로 이동
    router.push('/')
  } catch (error: any) {
    console.error('로그인 오류 상세:', error)
    toast.add({
      title: '로그인 실패',
      description: error.message || '로그인 중 오류가 발생했습니다.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 비밀번호 재설정을 위한 이메일 입력 상태
const resetEmailVisible = ref(false)
const resetEmail = ref('')

// 이메일 유효성 검사
const resetEmailValid = computed(() => {
  try {
    z.string().email().parse(resetEmail.value)
    return true
  } catch {
    return false
  }
})

// 비밀번호 재설정 대화상자 표시
function showResetPasswordDialog() {
  resetEmailVisible.value = true
  // 로그인 폼에 입력된 이메일이 있다면 사용
  if (document.querySelector('input[name="email"]')) {
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    if (emailInput && emailInput.value) {
      resetEmail.value = emailInput.value
    }
  }
}

// 비밀번호 재설정 처리 함수
async function resetPassword() {
  if (!resetEmailValid.value) {
    toast.add({
      title: '유효하지 않은 이메일',
      description: '유효한 이메일 주소를 입력해주세요.',
      color: 'error'
    })
    return
  }
  
  try {
    loading.value = true
    console.log('비밀번호 재설정 요청:', resetEmail.value)
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) {
      console.error('비밀번호 재설정 오류:', error)
      throw error
    }
    
    toast.add({
      title: '이메일 전송 완료',
      description: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      color: 'success'
    })
    
    // 대화상자 닫기
    resetEmailVisible.value = false
  } catch (error: any) {
    console.error('비밀번호 재설정 오류 상세:', error)
    toast.add({
      title: '이메일 전송 실패',
      description: error.message || '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UAuthForm
      :fields="fields"
      :schema="schema"
      :providers="providers"
      title="환영합니다"
      icon="i-lucide-lock"
      :submit="{ label: '로그인', loading }"
      @submit="onSubmit"
    >
      <template #description>
        계정이 없으신가요? <ULink
          to="/signup"
          class="text-(--ui-primary) font-medium"
        >회원가입</ULink>
      </template>

      <template #password-hint>
        <ULink
          @click="showResetPasswordDialog"
          class="text-(--ui-primary) font-medium cursor-pointer"
          tabindex="-1"
        >비밀번호를 잊으셨나요?</ULink>
      </template>

      <template #footer>
        로그인함으로써 <ULink
          to="/"
          class="text-(--ui-primary) font-medium"
        >서비스 약관</ULink>에 동의하게 됩니다.
      </template>
    </UAuthForm>

    <!-- 비밀번호 재설정 대화상자 -->
    <UModal v-model="resetEmailVisible">
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">비밀번호 재설정</h2>
        <p class="mb-4">계정에 등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
        
        <UFormGroup label="이메일" name="resetEmail">
          <UInput
            v-model="resetEmail"
            placeholder="이메일 주소를 입력하세요"
            type="email"
          />
        </UFormGroup>
        
        <div class="flex justify-end gap-2 mt-4">
          <UButton 
            color="gray" 
            variant="outline" 
            @click="resetEmailVisible = false"
          >
            취소
          </UButton>
          <UButton 
            color="primary" 
            :loading="loading"
            :disabled="!resetEmailValid"
            @click="resetPassword"
          >
            재설정 링크 전송
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>
