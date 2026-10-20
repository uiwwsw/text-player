# 🎬 Text Player

> **"텍스트가 영상이 되는 순간"**
> 입력한 텍스트를 키네틱 타이포그래피(Kinetic Typography) 스타일의 모션 그래픽으로 변환하여 재생하고 공유하는 웹 애플리케이션입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://text-player-three.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔗 Demo
👉 **Live Demo:** [https://text-player-three.vercel.app/](https://text-player-three.vercel.app/)

---

## 📝 Introduction

**Text Player**는 복잡한 영상 편집 도구 없이, 오직 **텍스트 입력**만으로 강렬한 메시지를 전달할 수 있는 비주얼 스토리텔링 도구입니다.

PPT나 긴 글 대신, 리듬감 있는 텍스트 모션을 통해 당신의 이야기를 청중에게 더 몰입감 있게 전달해보세요. 작성된 콘텐츠는 URL 하나로 손쉽게 공유할 수 있습니다.

## ✨ Key Features

- **⚡ Instant Kinetic Typography**: 텍스트를 입력하고 재생 버튼을 누르면 즉시 역동적인 모션 그래픽이 생성됩니다.
- **🔗 One-Click Sharing**: 완성된 플레이어는 고유 URL로 생성되어, 친구나 동료에게 바로 공유할 수 있습니다.
- **🎨 Visual Storytelling**: 단순한 정보 전달을 넘어, 시각적 즐거움과 함께 메시지를 각인시킵니다.
- **📱 Responsive Design**: PC, 태블릿, 모바일 어디서든 완벽하게 재생됩니다.

## 🚀 How to Use

1. **Access**: [데모 사이트](https://text-player-three.vercel.app/)에 접속합니다.
2. **Input**: 전달하고 싶은 메시지를 줄바꿈(Enter)으로 구분하여 입력합니다.
3. **Play**: 재생 버튼을 눌러 키네틱 효과를 확인합니다.
4. **Share**: 주소창의 URL을 복사하여 공유합니다. (입력한 데이터가 URL에 포함됩니다)

공유 URL을 가진 사람에게 내용이 전달될 수 있으므로 비밀번호, 토큰, 개인정보 등 민감한 내용을 입력하지 마세요.

## 🛠 Tech Stack

- **Runtime / UI**: Bun, React 19, TypeScript, React Router
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📦 Getting Started (Local Development)

개발 및 빌드 스크립트가 Bun을 사용하므로 Bun이 필요합니다. 저장소의 `bun.lock`을 의존성 기준으로 사용합니다.

```bash
git clone https://github.com/uiwwsw/text-player.git
cd text-player
bun install
bun run dev
```

개발 서버가 출력하는 주소로 접속합니다.

```bash
# 빌드
bun run build

# 프로덕션 모드 서버
bun run start
```

`package.json`에는 별도의 테스트 또는 린트 스크립트가 정의되어 있지 않습니다.
