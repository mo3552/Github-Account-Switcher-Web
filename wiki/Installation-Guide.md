# 설치 가이드

Git Credential Manager를 설치하는 방법을 안내합니다.

## 📋 시스템 요구사항

### 필수 요구사항

-   **운영체제**: Windows 10/11, macOS 10.14+, Ubuntu 18.04+
-   **Git**: 2.0.0 이상 버전
-   **메모리**: 최소 512MB RAM
-   **저장공간**: 최소 100MB 여유 공간

### 권장 사양

-   **운영체제**: Windows 11, macOS 12+, Ubuntu 20.04+
-   **Git**: 2.30.0 이상 버전
-   **메모리**: 2GB RAM 이상
-   **저장공간**: 500MB 여유 공간

## 🚀 다운로드 및 설치

### 1. 릴리즈 다운로드

[GitHub 릴리즈 페이지](https://github.com/mo3552/Github-Account-Switcher-Web/releases)에서 최신 버전을 다운로드하세요.

#### Windows

-   `Git Credential Manager Setup 1.0.0.exe` 파일 다운로드
-   실행 파일을 더블클릭하여 설치 시작
-   설치 마법사의 안내에 따라 설치 진행

#### macOS

-   `Git Credential Manager-1.0.0.dmg` 파일 다운로드
-   DMG 파일을 열고 Applications 폴더로 드래그
-   Applications 폴더에서 앱 실행

#### Linux

-   `Git Credential Manager-1.0.0.AppImage` 파일 다운로드
-   파일에 실행 권한 부여: `chmod +x Git-Credential-Manager-1.0.0.AppImage`
-   파일을 더블클릭하거나 터미널에서 실행

### 2. Git 설치 확인

프로그램 사용을 위해 Git이 설치되어 있어야 합니다.

#### Windows

```bash
git --version
```

#### macOS

```bash
git --version
```

#### Linux

```bash
git --version
```

Git이 설치되지 않은 경우:

-   **Windows**: [Git for Windows](https://git-scm.com/download/win) 다운로드
-   **macOS**: `brew install git` 또는 [Git for macOS](https://git-scm.com/download/mac)
-   **Linux**: `sudo apt install git` (Ubuntu/Debian) 또는 `sudo yum install git` (CentOS/RHEL)

## 🔧 초기 설정

### 1. 프로그램 실행

-   설치된 프로그램을 실행합니다
-   첫 실행 시 Git 설정을 확인합니다

### 2. Git 설정 확인

-   프로그램이 현재 Git 글로벌 설정을 자동으로 조회합니다
-   설정이 없는 경우 "설정되지 않음"으로 표시됩니다

### 3. 계정 추가

-   메뉴에서 "파일 > 새 계정 추가" 선택
-   또는 `Ctrl+N` 단축키 사용
-   이름과 이메일을 입력하여 계정 저장

## ✅ 설치 확인

설치가 완료되었는지 확인하는 방법:

1. **프로그램 실행**: Git Credential Manager가 정상적으로 실행되는지 확인
2. **Git 설정 조회**: 현재 Git 설정이 표시되는지 확인
3. **계정 추가**: 새 계정을 추가할 수 있는지 확인
4. **계정 전환**: 저장된 계정으로 전환할 수 있는지 확인

## 🐛 설치 문제 해결

### 일반적인 문제들

#### 프로그램이 실행되지 않음

-   **Windows**: 관리자 권한으로 실행 시도
-   **macOS**: 보안 설정에서 앱 실행 허용
-   **Linux**: 실행 권한 확인

#### Git 설정을 읽을 수 없음

-   Git이 올바르게 설치되었는지 확인
-   터미널에서 `git config --global --list` 명령어 실행
-   Git 설정이 올바른지 확인

#### 자격 증명 삭제 실패

-   Windows 자격 증명 관리자 접근 권한 확인
-   macOS Keychain Access 권한 확인
-   Linux에서 Git Credential Manager 설치 확인

## 📞 지원

설치 중 문제가 발생하면:

-   [GitHub Issues](https://github.com/mo3552/Github-Account-Switcher-Web/issues)에 문제 리포트
-   이메일: mo3552@gmail.com

---

**다음 단계**: [빠른 시작](Quick-Start) 가이드를 참조하여 프로그램 사용법을 익혀보세요.
