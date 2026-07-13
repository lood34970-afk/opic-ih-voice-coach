# OPIc IH Voice Coach - GitHub Pages 배포 방법

이 폴더는 GitHub Pages에 바로 올릴 수 있는 정적 웹사이트입니다.

## 가장 쉬운 방법: 웹에서 업로드

1. GitHub에서 새 저장소를 만듭니다.
   - 예: `opic-ih-voice-coach`
   - Public 권장. Private도 가능하지만 Pages 설정이 계정/플랜에 따라 다를 수 있습니다.
2. 저장소 화면에서 **Add file > Upload files** 를 누릅니다.
3. 이 폴더 안의 파일들을 업로드합니다.
   - `index.html`
   - `.nojekyll`
   - `README.md`
4. Commit changes를 누릅니다.
5. 저장소의 **Settings > Pages** 로 갑니다.
6. **Build and deployment**에서 다음처럼 설정합니다.
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
7. Save를 누르고 1~3분 기다립니다.
8. 발급되는 주소는 보통 아래 형태입니다.
   - `https://사용자이름.github.io/opic-ih-voice-coach/`

## 핸드폰에서 쓰기

발급된 GitHub Pages URL을 핸드폰 Chrome에서 여세요. HTTPS 주소라서 마이크 권한 요청이 정상적으로 뜰 가능성이 높습니다.

권장:
- Android Chrome: 가장 안정적
- iPhone Safari/Chrome: 음성 인식 기능이 제한될 수 있음

## 주의

마이크/음성인식 기능은 브라우저 정책 영향을 받습니다. `file://`로 직접 열지 말고 반드시 `https://...github.io/...` 주소로 접속하세요.
