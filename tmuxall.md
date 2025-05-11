# 🧩 `tmuxall.py` 사용 가이드
`tmuxall.py`는 프로젝트의 백엔드, 프론트엔드, WebSocket 서버 등을 **`tmux` 세션**으로 구성하여 동시에 실행하는 Python 스크립트입니다. 이 문서는 해당 스크립트를 실행한 후 사용할 수 있는 주요 `tmux` 명령어들과 그 효과를 정리합니다.

---

## 🚀 실행 방법

```bash
python tmuxall.py

세션 이름: cointracker

총 5개의 프로세스를 각각 tmux pane에 실행
Django 서버
Celery 워커
Celery 비트
프론트엔드 (npm)
FastAPI WebSocket
실행 후 자동으로 tmux 세션에 진입합니다.

🔑 자주 쓰는 tmux 명령어 정리
모든 명령어는 Prefix 키 Ctrl + b 후 해당 키를 누릅니다.

🧭 세션 제어
명령어	설명
Ctrl + b d	현재 세션에서 빠져나오기 (detach)
tmux a -t cointracker	cointracker 세션에 다시 접속
tmux ls	실행 중인 tmux 세션 목록 보기
tmux kill-session -t cointracker	세션 강제 종료
Ctrl + b s	세션 목록 보기 및 전환
Ctrl + b ( 또는 )	이전 / 다음 세션으로 전환

🪟 창(Window) 관리
명령어	설명
Ctrl + b c	새 창 생성
Ctrl + b ,	현재 창 이름 바꾸기
Ctrl + b n / p	다음 / 이전 창 이동
Ctrl + b <숫자>	번호로 창 이동 (0번부터 시작)
Ctrl + b &	현재 창 닫기
Ctrl + b w	창 목록 표시 및 선택

🧱 Pane(패널) 관리
명령어	설명
Ctrl + b %	좌우 분할
Ctrl + b "	상하 분할
Ctrl + b 방향키	패널 간 이동
Ctrl + b o	다음 패널로 순환
Ctrl + b x	현재 패널 종료
Ctrl + b z	패널 전체화면 토글
Ctrl + b !	패널을 새 창으로 분리
Ctrl + b q	패널 번호 표시 (이후 Ctrl + b <번호>로 이동)

📐 패널 크기 조절
명령어	설명
Ctrl + b Ctrl + ←/→/↑/↓	패널 크기 미세 조절
Ctrl + b Alt + ←/→/↑/↓	패널 크기 크게 조절

🛑 자동 종료 처리
tmuxall.py는 Ctrl + C 또는 스크립트 종료 시 cointracker 세션을 자동 종료합니다:

python
복사
편집
signal.signal(signal.SIGINT, signal_handler)
🔁 설정 변경 시 유용한 명령어
명령어	설명
Ctrl + b r	.tmux.conf 설정 다시 불러오기
Ctrl + b ?	전체 키 바인딩 목록 보기
Ctrl + b :	명령 모드 진입 (직접 명령 입력 가능)

📄 관련 파일
Python 스크립트: tmuxall.py

작동 방식 요약:

tmux new-session으로 세션 시작

tmux split-window로 각 명령 실행

tmux attach로 자동 진입

종료 시 자동 kill-session

🧹 세션 수동 종료
스크립트 외에 수동으로 세션을 종료하려면:

bash
복사
편집
tmux kill-session -t cointracker
🎯 팁
.tmux.conf 설정 커스터마이징을 통해 키 바인딩, 색상, 상태바 등을 변경할 수 있습니다.

Ctrl + b t로 현재 시간 확인 가능.

Ctrl + b :로 직접 split-window -h 등의 명령 입력도 가능합니다.