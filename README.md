# 예찬아! 그러면 안돼!

서울 골목을 돌아다니며 이어폰 줄을 풀어달라고 부탁하는 3D 미연시 프로토타입.

## 실행

```sh
npm install
npm run dev -- --port 5187
```

`npm test`: 확률 상한, 중복 아이템, 재추첨 차단, 다음 날 진행 및 저장 복원 검사.
`npm run build`: 배포 파일을 dist/에 생성.

## 독립 레이어

- `src/intro.js`: 시작, 건너뛰기, 오프닝 재생.
- `public/assets/intro-title.png`: 사용자가 제공한 투명 제목 PNG.
- `public/assets/intro-group.png`: 사용자가 제공한 단체사진. 이미지 파일을 수정하지 않고 CSS로 흐림을 적용.
- `src/style.css`의 `photo-reveal`, `title-reveal`, `invitation`: 약 7초 인트로 타이밍.
- `src/assets.js`: 플레이어, 배경, 등장인물의 모델/초상 경로 및 대사.
- `src/world.js`: Three.js 서울 골목, 독립 배경/캐릭터/아이템 그룹, GLB 교체.
- `src/rules.js`: 화면과 분리된 확률 및 게임 진행 규칙.
- `src/portrait.js`: 교체 전 사용하는 원본 벡터 초상.

설정 메뉴에서 GLB/PNG/JPEG/WebP를 개별 교체할 수 있습니다. 설정의 파일 업로드는 로컬에서만 읽고 현재 세션에 적용됩니다. 영구 반영하려면 public/assets에 파일을 놓고 assets.js에 경로를 지정합니다. GLB는 단일 파일에 텍스처가 포함된 형태를 권장합니다. 캐릭터 높이는 자동 정규화하며 배경은 원래 스케일을 유지합니다. 배경 모델 교체 시 기본 이동 범위(골목 폭)도 필요에 따라 world.js에서 조정합니다.

기본 확률 25%, 아이템마다 +5%, 10개에서 최대 75%. 도움을 받으면 매듭 1개가 풀리고 거절되면 1개 다시 꼬입니다. 총 5개 매듭과 6장의 상태 이미지를 사용합니다. 분홍 옷의 서유나에게 말을 걸면 확률 판정 없이 모든 매듭이 풀리고 특별 엔딩으로 이어집니다. 같은 사람에게 하루 한 번 부탁 가능. 다음 날에도 수집 아이템과 풀린 매듭은 유지. 브라우저 로컬 저장.

절차적 서울 배경, 완성된 여성 캐릭터 8명 GLB와 Idle/Walk, 남주인공 전신 GLB와 Walk_InPlace, 이어폰 상태 PNG 6장 및 시계 GLB를 연결했습니다. 원본 모델은 사진 기반 근사치이며 실제 인물의 정밀 스캔은 아닙니다.

## 배포

GitHub Actions가 main 브랜치 푸시 시 테스트와 빌드 후 GitHub Pages에 배포합니다. 저장소 이름을 변경하면 vite.config.js의 배포 base 경로도 변경하세요.

플레이: https://henkoo6326.github.io/yechan-earphones/
