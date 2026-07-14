# OPIc IH Voice Coach - OpenAI STT / Vercel Version

이 버전은 브라우저 기본 음성 인식 대신 OpenAI Speech-to-text를 사용합니다.

## 작동 방식

1. 문제 듣기
2. 답변 시작
3. 브라우저가 음성을 녹음만 함
4. 종료 버튼
5. `/api/transcribe` 서버리스 함수가 녹음 파일을 OpenAI API로 전송
6. 더 정확한 transcript로 OPIc 피드백 생성

## Vercel 배포 방법

1. Vercel에 로그인합니다.
2. Add New Project 또는 Import Project를 누릅니다.
3. GitHub 저장소 `lood34970-afk/opic-ih-voice-coach`를 선택합니다.
4. Environment Variables에 아래 값을 추가합니다.

```text
OPENAI_API_KEY=본인_OpenAI_API_Key
```

선택 옵션:

```text
OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe
```

5. Deploy를 누릅니다.
6. Vercel이 발급한 `https://...vercel.app` 주소를 핸드폰 Chrome에서 엽니다.

## 주의

GitHub Pages 주소에서는 `/api/transcribe` 서버리스 함수가 동작하지 않습니다. 반드시 Vercel 주소로 접속해야 OpenAI 음성 인식이 작동합니다.
