<script setup lang="ts">
import { useSupabase } from '~/utils/supabase'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: '내 프로필'
})

const toast = useToast()
const supabase = useSupabase()
const user = ref(null)
const loading = ref(true)
const updating = ref(false)
const error = ref(null)

// 프로필 정보 스키마
const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  website: z.string().url('유효한 URL을 입력해주세요').optional().or(z.literal('')),
  avatar_url: z.string().optional()
})

type ProfileSchema = z.infer<typeof schema>

// 프로필 정보 초기화
const profile = ref<ProfileSchema>({
  name: '',
  website: '',
  avatar_url: ''
})

// 사용자 정보 로드
async function fetchUserProfile() {
  try {
    loading.value = true
    
    // 현재 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError) throw userError
    
    user.value = userData.user
    
    if (!user.value) {
      throw new Error('사용자 정보를 찾을 수 없습니다')
    }
    
    // 프로필 정보 설정
    const metadata = user.value.user_metadata || {}
    profile.value = {
      name: metadata.name || '',
      website: metadata.website || '',
      avatar_url: metadata.avatar_url || ''
    }
    
    console.log('프로필 정보 로드됨:', profile.value)
  } catch (err) {
    console.error('프로필 정보 로드 오류:', err)
    error.value = err
    
    toast.add({
      title: '프로필 로드 실패',
      description: '프로필 정보를 가져오는 중 오류가 발생했습니다.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 프로필 정보 업데이트
async function updateProfile(event: FormSubmitEvent<ProfileSchema>) {
  try {
    updating.value = true
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
        name: event.data.name,
        website: event.data.website,
        avatar_url: event.data.avatar_url
      }
    })
    
    if (updateError) throw updateError
    
    toast.add({
      title: '프로필 업데이트 성공',
      description: '프로필 정보가 성공적으로 업데이트되었습니다.',
      color: 'success'
    })
    
    // 사용자 정보 갱신
    user.value = data.user
  } catch (err) {
    console.error('프로필 업데이트 오류:', err)
    
    toast.add({
      title: '프로필 업데이트 실패',
      description: '프로필 정보를 업데이트하는 중 오류가 발생했습니다.',
      color: 'error'
    })
  } finally {
    updating.value = false
  }
}

// 컴포넌트 마운트 시 프로필 정보 로드
onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">내 프로필</h1>
      
      <div v-if="loading">
        <div class="flex justify-center my-8">
          <USpinner size="lg" />
        </div>
      </div>
      
      <template v-else-if="user">
        <div class="mb-8 flex items-center">
          <UAvatar
            :src="user.user_metadata?.avatar_url"
            :alt="user.user_metadata?.name || user.email"
            size="xl"
            class="mr-4"
          />
          
          <div>
            <h2 class="text-xl font-medium">{{ user.user_metadata?.name || '사용자' }}</h2>
            <p class="text-gray-500">{{ user.email }}</p>
          </div>
        </div>
        
        <UCard>
          <UForm
            :schema="schema"
            :state="profile"
            class="space-y-4"
            @submit="updateProfile"
          >
            <UFormGroup label="이름" name="name">
              <UInput v-model="profile.name" placeholder="이름을 입력하세요" />
            </UFormGroup>
            
            <UFormGroup label="웹사이트" name="website">
              <UInput v-model="profile.website" placeholder="웹사이트 URL을 입력하세요" />
            </UFormGroup>
            
            <UFormGroup label="프로필 이미지 URL" name="avatar_url">
              <UInput v-model="profile.avatar_url" placeholder="프로필 이미지 URL" />
            </UFormGroup>
            
            <div class="flex justify-end">
              <UButton
                type="submit"
                color="primary"
                :loading="updating"
              >
                프로필 업데이트
              </UButton>
            </div>
          </UForm>
        </UCard>
        
        <UCard class="mt-8">
          <div class="space-y-4">
            <h3 class="text-lg font-medium">계정 관리</h3>
            
            <UButton
              color="red"
              variant="ghost"
              icon="i-lucide-log-out"
              @click="$router.push('/auth/change-password')"
            >
              비밀번호 변경
            </UButton>
          </div>
        </UCard>
      </template>
      
      <div v-else class="text-center py-8">
        <p class="text-lg mb-4">로그인이 필요합니다</p>
        <UButton to="/login" color="primary">로그인 페이지로 이동</UButton>
      </div>
    </div>
  </UContainer>
</template> 