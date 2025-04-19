<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useSupabase } from '~/utils/supabase'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: '비밀번호 재설정'
})

const toast = useToast()
const router = useRouter()
const loading = ref(false)
const supabase = useSupabase()

const fields = [{
  name: 'password',
  label: '새 비밀번호',
  type: 'password' as const,
  placeholder: '새 비밀번호를 입력하세요'
}, {
  name: 'confirmPassword',
  label: '비밀번호 확인',
  type: 'password' as const,
  placeholder: '비밀번호를 다시 입력하세요'
}]

const schema = z.object({
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  confirmPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다')
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    
    // Supabase 비밀번호 업데이트
    const { error } = await supabase.auth.updateUser({
      password: payload.data.password
    })
    
    if (error) throw error
    
    // 성공 메시지 표시
    toast.add({
      title: '비밀번호 변경 성공',
      description: '비밀번호가 성공적으로 변경되었습니다.',
      color: 'success'
    })
    
    // 로그인 페이지로 이동
    router.push('/login')
  } catch (error: any) {
    toast.add({
      title: '비밀번호 변경 실패',
      description: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
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
    title="비밀번호 재설정"
    icon="i-lucide-key"
    :submit="{ label: '비밀번호 변경', loading }"
    @submit="onSubmit"
  >
    <template #description>
      새로운 비밀번호를 입력해주세요.
    </template>
    
    <template #footer>
      <div class="text-center">
        <ULink
          to="/login"
          class="text-(--ui-primary) font-medium"
        >로그인 페이지로 돌아가기</ULink>
      </div>
    </template>
  </UAuthForm>
</template> 