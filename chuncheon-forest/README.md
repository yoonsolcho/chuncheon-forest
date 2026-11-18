# 🌲 춘천의 숲 (CHUNCHEON FOREST)

Three.js + Vite 기반 3D 힐링 마을 꾸미기 프로토타입.

## 실행
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성
```

## GitHub → Vercel 배포
1. 이 폴더를 GitHub 저장소로 push
2. vercel.com → Add New Project → 저장소 선택
3. Framework: **Vite** 자동 감지 (Build `npm run build`, Output `dist`) → Deploy
4. 이후 `git push` 할 때마다 자동 재배포

## 구조
```
index.html      HUD·모달 UI
src/main.js     맵 / 이동 / 감자 농사 / 건설 / 낮밤 (지금은 한 파일, 커지면 분리)
```

## 단계별 계획
| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 기본 맵(호수·숲·집·산), 낮/밤 | ✅ |
| 2 | 이름 설정, 클릭/터치/방향키 이동, 닭 펫 | ✅ |
| 3 | 감자 심기·물주기·수확, 재화 | ✅ |
| 4 | 건설 부지 → 스카이워크 건설(전/후), 관광지 소개 | ✅ |
| 5 | NPC 대화 + 간단 미션 | ⛔ 미구현 |
| 6 | 자리에 앉기 (벤치 등 앉기 포인트) | ⛔ 미구현 |
| 7 | 실시간 멀티플레이 | ⛔ 미구현 |
| 8 | 추가 관광지, 꾸미기 | ⛔ 미구현 |

## 7단계(멀티플레이) 설계 메모
Vercel 서버리스 함수는 WebSocket 연결을 유지할 수 없어서, 별도 실시간 서비스가 필요합니다.
- 권장: **Supabase Realtime** (Presence + Broadcast) 또는 PartyKit / Ably
- 같은 채널에 접속 → 내 상태 `{id, name, x, z, rotY}`를 약 10Hz로 broadcast
- 받는 쪽은 원격 플레이어 모델을 만들고 위치를 보간(lerp)
- 감자밭/건설 상태를 공유하려면 DB 저장 + 서버 검증이 필요
- 저장은 현재 `localStorage`(브라우저별)

## 알려둘 점
- 스카이워크 소개 문구는 프로토타입용이므로 방문 전 공식 안내로 확인하세요.
