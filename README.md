# OPIc IH Voice Coach - OpenAI STT/TTS / Vercel Version

이 버전은 브라우저 기본 음성 인식 대신 OpenAI Speech-to-text를 사용하고, 피드백 읽기는 OpenAI Text-to-speech를 사용합니다.

## 작동 방식

1. 문제 듣기
2. 답변 시작
3. 브라우저가 음성을 녹음만 함
4. 종료 버튼
5. `/api/transcribe` 서버리스 함수가 녹음 파일을 OpenAI API로 전송
6. `/api/feedback` 서버리스 함수가 transcript를 GPT로 정밀 평가
7. 질문 적합도, 문법, 자연스러운 표현, IH 답변 구조 피드백 생성
8. `/api/speak` 서버리스 함수가 피드백을 OpenAI TTS MP3로 변환
9. 피드백 생성 후 자동으로 음성 읽기

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
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_FEEDBACK_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=nova
```

5. Deploy를 누릅니다.
6. Vercel이 발급한 `https://...vercel.app` 주소를 핸드폰 Chrome에서 엽니다.

## 주의

GitHub Pages 주소에서는 `/api/transcribe` 서버리스 함수가 동작하지 않습니다. 반드시 Vercel 주소로 접속해야 OpenAI 음성 인식이 작동합니다.

기본 음성인식은 비용을 낮추기 위해 `gpt-4o-mini-transcribe`입니다. 더 높은 정확도가 필요하면 Vercel 환경변수 `OPENAI_TRANSCRIBE_MODEL`을 `gpt-4o-transcribe`로 바꾸면 됩니다.

기본 정밀 피드백 모델은 `gpt-4o-mini`입니다. `OPENAI_FEEDBACK_MODEL`은 선택값이라 설정하지 않아도 됩니다.

기본 피드백 읽기 모델은 `gpt-4o-mini-tts`, 기본 음성은 `nova`입니다. `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`는 선택값이라 설정하지 않아도 됩니다.
