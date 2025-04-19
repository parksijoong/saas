import { createClient } from '@supabase/supabase-js'

// 전역 클라이언트 변수 선언
let supabaseClient: ReturnType<typeof createClient> | null = null

// Supabase 클라이언트를 가져오는 함수
export function useSupabase() {
  // 이미 클라이언트가 생성되었다면 그것을 반환
  if (supabaseClient) return supabaseClient
  
  // composable은 컴포넌트 내부에서만 사용 가능
  const runtimeConfig = useRuntimeConfig()
  const supabaseUrl = runtimeConfig.public.supabaseUrl
  const supabaseKey = runtimeConfig.public.supabaseKey
  
  console.log('Supabase 설정 확인:', {
    urlDefined: !!supabaseUrl,
    keyDefined: !!supabaseKey,
    url: supabaseUrl?.substring(0, 10) + '...'
  })
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL 또는 Key가 제공되지 않았습니다.')
    throw new Error('Supabase 설정이 누락되었습니다.')
  }
  
  // 클라이언트 생성 및 캐싱
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
    console.log('Supabase 클라이언트 생성 성공')
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error)
    throw error
  }
  
  return supabaseClient
}

export default useSupabase 