# Git Credential Manager

Git 글로벌 설정 관리 및 GitHub 자격 증명 자동 삭제 도구

## 📋 프로젝트 개요

Electron 기반 데스크탑 애플리케이션으로, Git 글로벌 설정(`user.name`, `user.email`)을 관리하고 설정 변경 시 Windows 자격 증명 관리자에서 GitHub 관련 자격 증명을 자동으로 삭제하여 인증 문제를 예방합니다.

## ✨ 주요 기능

-   **Git 글로벌 설정 조회**: 현재 설정된 `user.name`과 `user.email` 표시
-   **계정 관리**: 여러 Git 계정을 저장하고 관리
-   **계정 전환**: 저장된 계정으로 Git 글로벌 설정 변경
-   **자동 자격 증명 삭제**: 설정 변경 시 GitHub 자격 증명 자동 삭제
-   **직관적인 UI**: Vue 3 기반의 현대적이고 사용하기 쉬운 인터페이스
-   **한글 지원**: 완전한 한글 UI 및 메뉴

## 🛠 기술 스택

-   **UI 프레임워크**: Vue 3 (Composition API)
-   **빌드 도구**: Vite
-   **언어**: TypeScript
-   **데스크탑 프레임워크**: Electron
-   **통신 방식**: IPC (Inter-Process Communication)
-   **시스템 명령 실행**: Node.js `child_process`
-   **폰트**: Pretendard

## 🚀 설치 및 실행

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/mo3552/Github-Account-Switcher-Web.git
cd Github-Account-Switcher-Web

# 의존성 설치
npm install

# 개발 모드 실행
npm run electron:serve
```

### 빌드

```bash
# 프로덕션 빌드
npm run electron:build
```

빌드된 파일은 `release/` 폴더에 생성됩니다:

-   `Git Credential Manager Setup 1.0.0.exe` - Windows 설치 프로그램
-   `win-unpacked/Git Credential Manager.exe` - 실행 파일

## 📁 프로젝트 구조

```
github_switcher_web/
├── electron/                 # Electron 메인 프로세스
│   ├── main.ts              # 메인 프로세스 로직
│   └── preload.ts           # 프리로드 스크립트
├── src/                     # Vue 애플리케이션
│   ├── App.vue              # 메인 컴포넌트
│   ├── main.ts              # Vue 앱 진입점
│   ├── style.css            # 전역 스타일
│   └── vite-env.d.ts        # Vite 타입 선언
├── public/                  # 정적 파일
│   └── favicon.ico          # 앱 아이콘
├── package.json             # 프로젝트 설정
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TypeScript 설정
└── README.md                # 프로젝트 문서
```

## 🔧 주요 기능 설명

### 1. Git 설정 관리

-   `git config --global user.name` 및 `git config --global user.email` 명령어를 통해 Git 글로벌 설정을 조회하고 변경
-   설정 변경 시 입력값 검증 (이름, 이메일 형식)

### 2. 자격 증명 자동 삭제

-   Git 설정 변경 성공 시 `cmdkey /delete:git:https://github.com` 명령어로 Windows 자격 증명 관리자에서 GitHub 관련 자격 증명 삭제
-   인증 문제 예방 및 새로운 계정으로의 원활한 전환 지원

### 3. 계정 관리 시스템

-   JSON 파일을 통한 계정 정보 영구 저장
-   저장 위치: `%APPDATA%/Git Credential Manager/accounts.json`
-   계정 추가, 삭제, 전환 기능
-   중복 이메일 체크

### 4. 사용자 인터페이스

-   **현재 Git 설정 표시**: 현재 설정된 계정 정보 표시
-   **저장된 계정 목록**: 저장된 모든 계정을 카드 형태로 표시
-   **새 계정 추가**: 모달을 통한 새 계정 추가 (메뉴 또는 Ctrl+N)
-   **계정 전환**: "적용" 버튼으로 해당 계정으로 전환
-   **계정 삭제**: "삭제" 버튼으로 계정 제거
-   **토스트 알림**: 3초 후 자동 사라지는 알림 시스템

## 🎨 UI/UX 특징

-   **반응형 디자인**: 800x800 고정 창 크기
-   **한글 인터페이스**: 모든 텍스트와 메뉴가 한글로 표시
-   **텍스트 선택 방지**: 드래그로 텍스트 선택 방지
-   **모던한 디자인**: 깔끔하고 직관적인 UI
-   **접근성**: 키보드 단축키 지원 (Ctrl+N, Ctrl+Q)

## 📋 메뉴 구조

```
파일
├── 새 계정 추가 (Ctrl+N)
├── ─────────────
└── 종료 (Ctrl+Q)

보기
├── 새로고침
└── 강제 새로고침

도움말
└── 정보 (프로그램 정보, 버전, 제작자)
```

## 🔒 보안 고려사항

-   **Context Isolation**: 렌더러 프로세스와 메인 프로세스 간 안전한 통신
-   **Sandbox**: 보안 강화를 위한 샌드박스 모드
-   **Content Security Policy**: XSS 공격 방지를 위한 CSP 설정
-   **입력값 검증**: 사용자 입력에 대한 철저한 검증
-   **자격 증명 삭제 알림**: 민감한 작업에 대한 사용자 알림

## 🐛 오류 처리

-   **Git 미설치**: Git이 설치되지 않은 경우 적절한 오류 메시지 표시
-   **자격 증명 삭제 실패**: 자격 증명 삭제 실패 시에도 Git 설정은 변경되도록 처리
-   **파일 시스템 오류**: 계정 저장/로드 실패 시 오류 처리
-   **네트워크 오류**: 개발 모드에서 서버 연결 실패 시 처리

## 📝 개발 히스토리

### 주요 변경사항

1. **초기 설정**: Vue 3 + Electron + TypeScript 프로젝트 구성
2. **기능 구현**: Git 설정 관리 및 자격 증명 삭제 기능
3. **UI 개선**: 계정 목록 관리 및 모달 시스템 추가
4. **사용성 개선**: 한글 메뉴, 토스트 알림, 텍스트 선택 방지
5. **보안 강화**: CSP 설정 및 보안 정책 적용
6. **빌드 최적화**: 프로덕션 빌드 설정 및 아이콘 변경

### 해결된 문제들

-   ✅ TypeScript 모듈 인식 문제 해결
-   ✅ Electron 창 중복 생성 문제 해결
-   ✅ 개발자 도구 자동 열림 문제 해결
-   ✅ 계정 중복 체크 로직 개선
-   ✅ UI 반응성 문제 해결
-   ✅ 빌드 프로세스 최적화

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 제작자

-   **Mario** - [mo3552@gmail.com](mailto:mo3552@gmail.com)
-   **GitHub**: [@mo3552](https://github.com/mo3552)

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 [GitHub Issues](https://github.com/mo3552/Github-Account-Switcher-Web/issues)를 통해 문의해주세요.

---

**버전**: 1.0.0  
**최종 업데이트**: 2024년 12월
