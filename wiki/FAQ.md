# 자주 묻는 질문 (FAQ)

Git Credential Manager 사용 중 자주 묻는 질문들과 답변을 모았습니다.

## 🔧 설치 및 설정

### Q: 프로그램이 실행되지 않습니다.

**A:** 다음 사항들을 확인해보세요:

-   Git이 설치되어 있는지 확인: `git --version`
-   Windows: 관리자 권한으로 실행 시도
-   macOS: 보안 설정에서 앱 실행 허용
-   Linux: 실행 권한 확인: `chmod +x 파일명.AppImage`

### Q: Git 설정을 읽을 수 없다는 오류가 발생합니다.

**A:** Git이 올바르게 설치되어 있는지 확인하세요:

```bash
git config --global --list
```

Git이 설치되지 않은 경우:

-   **Windows**: [Git for Windows](https://git-scm.com/download/win) 다운로드
-   **macOS**: `brew install git` 또는 [Git for macOS](https://git-scm.com/download/mac)
-   **Linux**: `sudo apt install git` (Ubuntu/Debian)

### Q: 프로그램을 두 번 실행하면 어떻게 되나요?

**A:** 프로그램은 단일 인스턴스로만 실행됩니다:

-   두 번째 실행 시도 시 기존 인스턴스가 포커스됩니다
-   최소화된 상태라면 자동으로 복원됩니다
-   데이터 충돌을 방지하기 위한 안전장치입니다

## 💾 계정 관리

### Q: 계정을 추가할 때 중복 이메일 오류가 발생합니다.

**A:** 동일한 이메일 주소로는 계정을 추가할 수 없습니다:

-   기존 계정을 삭제하고 다시 추가하거나
-   다른 이메일 주소를 사용하세요
-   이는 Git 설정의 일관성을 유지하기 위한 제한입니다

### Q: 저장된 계정 정보는 어디에 저장되나요?

**A:** 계정 정보는 다음 위치에 저장됩니다:

-   **Windows**: `%APPDATA%\Git Credential Manager\accounts.json`
-   **macOS**: `~/Library/Application Support/Git Credential Manager/accounts.json`
-   **Linux**: `~/.config/Git Credential Manager/accounts.json`

### Q: 계정 정보를 백업할 수 있나요?

**A:** 네, `accounts.json` 파일을 복사하여 백업할 수 있습니다:

-   위 경로에서 `accounts.json` 파일을 찾아 복사
-   안전한 위치에 보관
-   필요 시 파일을 원래 위치에 복원

## 🔐 자격 증명 관리

### Q: 자격 증명 삭제가 실패한다는 메시지가 나옵니다.

**A:** 플랫폼별 해결 방법:

#### Windows

-   Windows 자격 증명 관리자에서 수동으로 삭제
-   관리자 권한으로 프로그램 실행
-   `cmdkey /delete:git:https://github.com` 명령어 직접 실행

#### macOS

-   Keychain Access에서 GitHub 관련 항목 수동 삭제
-   Git Credential Manager 설치: `brew install git-credential-manager`
-   `git credential-manager delete https://github.com` 명령어 실행

#### Linux

-   Git Credential Manager 설치: `sudo apt install git-credential-manager`
-   `git credential-manager delete https://github.com` 명령어 실행

### Q: 자격 증명 삭제가 실패해도 Git 설정은 변경되나요?

**A:** 네, Git 설정은 정상적으로 변경됩니다:

-   자격 증명 삭제 실패는 별도로 알림
-   Git 설정 변경과 자격 증명 삭제는 독립적으로 처리
-   설정 변경 후 수동으로 자격 증명 삭제 가능

## 🖥️ 사용자 인터페이스

### Q: 화면이 깜빡이는 현상이 있습니다.

**A:** 이는 정상적인 현상입니다:

-   프로그램 로딩 과정에서 발생할 수 있음
-   하드웨어 가속 비활성화로 최소화됨
-   성능에 영향을 주지 않음

### Q: 텍스트를 선택할 수 없습니다.

**A:** 이는 의도된 설계입니다:

-   사용자 경험 향상을 위해 텍스트 선택 방지
-   드래그로 텍스트 선택이 차단됨
-   복사가 필요한 경우 메뉴에서 "정보" 확인

### Q: 창 크기를 변경할 수 없나요?

**A:** 네, 800x800 고정 크기로 설계되었습니다:

-   모든 요소가 최적화된 레이아웃
-   일관된 사용자 경험 제공
-   반응형 디자인으로 모든 내용이 적절히 표시

## 🔄 기능 관련

### Q: 계정 전환 후 Git 명령어를 실행해야 하나요?

**A:** 아니요, 즉시 적용됩니다:

-   프로그램에서 설정 변경 시 즉시 Git 글로벌 설정에 반영
-   별도의 Git 명령어 실행 불필요
-   `git config --global --list`로 확인 가능

### Q: 여러 Git 저장소에서 다른 계정을 사용하려면?

**A:** 현재는 글로벌 설정만 지원합니다:

-   모든 Git 저장소에 동일한 계정 적용
-   저장소별 설정은 수동으로 `git config user.name` 및 `git config user.email` 사용
-   향후 버전에서 저장소별 설정 기능 추가 예정

### Q: 프로그램을 업데이트하면 계정 정보가 사라지나요?

**A:** 아니요, 계정 정보는 보존됩니다:

-   사용자 데이터 폴더에 저장되어 업데이트와 무관
-   프로그램 재설치 시에도 유지
-   수동으로 삭제하지 않는 한 보존됨

## 🐛 오류 해결

### Q: "Git 설정을 조회할 수 없습니다" 오류

**A:** 다음 순서로 확인해보세요:

1. Git 설치 확인: `git --version`
2. Git 설정 확인: `git config --global --list`
3. 프로그램 재시작
4. 컴퓨터 재부팅

### Q: 토스트 알림이 나타나지 않습니다.

**A:** 알림 설정을 확인해보세요:

-   Windows: 알림 설정에서 앱 알림 허용
-   macOS: 알림 센터 설정 확인
-   Linux: 데스크톱 환경의 알림 설정 확인

### Q: 프로그램이 느리게 실행됩니다.

**A:** 다음 사항들을 확인해보세요:

-   시스템 리소스 사용량 확인
-   다른 프로그램과의 충돌 확인
-   프로그램 재시작
-   컴퓨터 재부팅

## 📞 추가 지원

### Q: 여기서 답변을 찾을 수 없는 문제가 있습니다.

**A:** 다음 방법으로 도움을 받을 수 있습니다:

-   [GitHub Issues](https://github.com/mo3552/Github-Account-Switcher-Web/issues)에 문제 리포트
-   이메일: mo3552@gmail.com
-   [문제 해결](Troubleshooting) 가이드 참조

### Q: 새로운 기능을 제안하고 싶습니다.

**A:** GitHub Issues를 통해 제안해주세요:

-   [Feature Request](https://github.com/mo3552/Github-Account-Switcher-Web/issues/new?template=feature_request.md) 템플릿 사용
-   구체적인 사용 사례와 함께 제안
-   커뮤니티 피드백 참고

---

**관련 문서**: [문제 해결](Troubleshooting), [기본 사용법](Basic-Usage)
