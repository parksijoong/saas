import { useSupabase } from '~/utils/supabase'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return // 서버 사이드에서는 실행하지 않음
  
  const supabase = useSupabase()
  const toast = useToast()
  
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    // 로그인 상태가 아니면 로그인 페이지로 리디렉션
    if (!data.session) {
      toast.add({
        title: '로그인 필요',
        description: '이 페이지에 접근하려면 로그인이 필요합니다.',
        color: 'warning'
      })
      
      return navigateTo('/login')
    }
  } catch (error) {
    console.error('인증 확인 오류:', error)
    
    toast.add({
      title: '인증 오류',
      description: '로그인 상태를 확인하는 중 오류가 발생했습니다.',
      color: 'error'
    })
    
    return navigateTo('/login')
  }
}) 