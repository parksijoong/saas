<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useSupabase } from '~/utils/supabase'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up'
})

const toast = useToast()
const router = useRouter()
const loading = ref(false)
const supabase = useSupabase()

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
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
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    
    // 1. Supabase 회원가입
    const { data, error } = await supabase.auth.signUp({
      email: payload.data.email,
      password: payload.data.password,
      options: {
        data: {
          name: payload.data.name
        }
      }
    })
    
    if (error) throw error
    
    // 2. 성공 메시지 표시
    toast.add({
      title: '회원가입 성공',
      description: '이메일 확인 링크가 발송되었습니다. 확인해주세요.',
      color: 'success'
    })
    
    // 3. 로그인 페이지로 이동
    router.push('/login')
  } catch (error: any) {
    toast.add({
      title: '회원가입 실패',
      description: error.message || '회원가입 중 오류가 발생했습니다.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="계정 만들기"
    :submit="{ label: '계정 만들기', loading }"
    @submit="onSubmit"
  >
    <template #description>
      이미 계정이 있으신가요? <ULink
        to="/login"
        class="text-(--ui-primary) font-medium"
      >로그인</ULink>
    </template>

    <template #footer>
      가입함으로써 <ULink
        to="/"
        class="text-(--ui-primary) font-medium"
      >서비스 약관</ULink>에 동의하게 됩니다.
    </template>
  </UAuthForm>
</template>
