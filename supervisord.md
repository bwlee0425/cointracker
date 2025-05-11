# 🛠 Supervisor 설정 가이드

이 프로젝트는 `supervisord`를 통해 여러 백엔드/프론트엔드 서비스들을 동시에 관리할 수 있도록 구성되어 있습니다. 아래 명령어와 구성을 참고하여 사용하세요.

---

## 📁 설정 파일 위치

Supervisor 설정 파일: `supervisord.conf`

---

## 🧪 주요 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `supervisord -c supervisord.conf` | Supervisor 데몬 실행 (한 번만 실행) |
| `supervisord -n -c supervisord.conf` | Supervisor 데몬 실행 (한 번만 실행), 터미널에서 직접 로그 확인 |
| `supervisorctl` | Supervisor CLI 진입 |
| `supervisorctl status` | 모든 프로세스 상태 확인 |
| `supervisorctl start <프로그램명>` | 특정 프로그램 시작 |
| `supervisorctl stop <프로그램명>` | 특정 프로그램 중지 |
| `supervisorctl restart <프로그램명>` | 특정 프로그램 재시작 |
| `supervisorctl reread` | 설정 변경 감지 (새 프로그램 추가 등) |
| `supervisorctl update` | 감지된 변경 반영 |
| `supervisorctl reload` | Supervisor 자체 재시작 및 구성 반영 |

---

## 📦 프로그램 구성

| 프로그램명 | 설명 | 예시 명령어 |
|------------|------|--------------|
| `django` | Django 개발 서버 | `supervisorctl restart django` |
| `celery_worker` | Celery 워커 | `supervisorctl stop celery_worker` |
| `celery_beat` | Celery 스케줄러 | `supervisorctl status celery_beat` |
| `binance_fastapi_ws` | FastAPI 기반 WebSocket 서버 | `supervisorctl restart binance_fastapi_ws` |
| `frontend` | 프론트엔드 개발 서버 (`npm run dev`) | `supervisorctl restart frontend` |

---