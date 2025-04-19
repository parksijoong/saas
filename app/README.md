# OAuth 소셜 로그인 구성 가이드

## Supabase OAuth 설정 방법

### 1. Supabase 대시보드 설정

1. [Supabase 대시보드](https://app.supabase.com)에 로그인합니다.
2. 해당 프로젝트로 이동합니다.
3. 왼쪽 메뉴에서 **Authentication** -> **Providers**로 이동합니다.
4. 설정할 소셜 로그인 제공자(Google, GitHub 등)를 활성화합니다.

### 2. Site URL 설정

1. Supabase 대시보드에서 **Authentication** -> **URL Configuration**으로 이동합니다.
2. **Site URL**을 다음과 같이 설정합니다:
   - 개발 환경: `http://localhost:3000`
   - 배포 환경: 실제 도메인 URL (예: `https://yourdomain.com`)

### 3. OAuth 제공자 설정

#### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.
2. API 및 서비스 -> 사용자 인증 정보로 이동합니다.
3. OAuth 동의 화면을 구성합니다.
4. "사용자 인증 정보 만들기" -> "OAuth 클라이언트 ID"를 선택합니다.
5. 애플리케이션 유형으로 "웹 애플리케이션"을 선택합니다.
6. **승인된 리디렉션 URI**에 다음을 추가합니다:
   - `https://vhlrmurvwbhqopvbsnji.supabase.co/auth/v1/callback`
7. 생성된 클라이언트 ID와 클라이언트 비밀을 Supabase 대시보드의 Google 제공자 설정에 입력합니다.

#### GitHub OAuth 설정

1. GitHub 계정에서 [Developer Settings](https://github.com/settings/developers)으로 이동합니다.
2. "New OAuth App"을 클릭합니다.
3. 애플리케이션 이름, 홈페이지 URL을 입력합니다.
4. **Authorization callback URL**에 다음을 입력합니다:
   - `https://vhlrmurvwbhqopvbsnji.supabase.co/auth/v1/callback`
5. 생성된 클라이언트 ID와 클라이언트 비밀을 Supabase 대시보드의 GitHub 제공자 설정에 입력합니다.

### 4. 추가 리디렉션 URL 설정 (중요)

1. Supabase 대시보드의 **Authentication** -> **URL Configuration**으로 이동합니다.
2. **Redirect URLs**에 다음을 추가합니다:
   - 개발 환경: `http://localhost:3000/auth/callback`
   - 배포 환경: `https://yourdomain.com/auth/callback`

## 문제 해결

소셜 로그인 중 400 오류가 발생하는 경우:

1. 브라우저 콘솔 로그를 확인하여 정확한 오류 메시지를 확인합니다.
2. Supabase 대시보드에서 **Authentication** -> **Logs**를 확인하여 인증 시도 및 오류를 확인합니다.
3. 모든 리디렉션 URL이 정확히 등록되었는지 확인합니다.
4. 개발 환경에서는 `http://localhost:3000`이 허용된 URL인지 확인합니다.
5. OAuth 제공자 콘솔(Google Cloud Console, GitHub Developer Settings)에서 리디렉션 URL이 정확히 설정되었는지 확인합니다. 