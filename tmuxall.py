import subprocess
import signal
import sys

SESSION_NAME = "cointracker"

COMMANDS = [
    'bash -c "cd be && export DJANGO_SETTINGS_MODULE=config.settings && python manage.py runserver"', # PANEL_
    'bash -c "cd be && export DJANGO_SETTINGS_MODULE=config.settings && uvicorn data_collection.websocket.binance_fastapi_ws:app --host 0.0.0.0 --port 8001"', # PANEL_
    'bash -c "cd frontend && npm run dev"', # PANEL_
    'bash -c "cd be && export DJANGO_SETTINGS_MODULE=config.settings && celery -A config beat -l debug --scheduler django_celery_beat.schedulers:DatabaseScheduler"', # PANEL_
    'bash -c "cd be && export DJANGO_SETTINGS_MODULE=config.settings && celery -A config worker -l debug"', # PANEL_
    'zsh','zsh' # PANEL_
]

def kill_tmux_session():
    print("\nKilling tmux session...")
    subprocess.run(["tmux", "kill-session", "-t", SESSION_NAME])

def signal_handler(sig, frame):
    kill_tmux_session()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def main():
    # 기존 세션 종료
    subprocess.run(["tmux", "kill-session", "-t", SESSION_NAME], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 새로운 세션 시작 및 첫 번째 명령어 실행 (PANEL_1)
    subprocess.run(["tmux", "new-session", "-d", "-s", SESSION_NAME, COMMANDS[0]])

    # 분할
    subprocess.run(["tmux", "split-window", "-v", "-t", "1", COMMANDS[5]]) # PANEL_6 생성 (인덱스 2?)
    subprocess.run(["tmux", "split-window", "-h", "-t", "1", COMMANDS[1]]) # PANEL_2 생성 (인덱스 3?)
    subprocess.run(["tmux", "split-window", "-v", "-t", "1", COMMANDS[2]]) # PANEL_3 생성 (인덱스 4?)
    subprocess.run(["tmux", "split-window", "-v", "-t", "3", COMMANDS[3]]) # PANEL_4 생성 (인덱스 5?)
    subprocess.run(["tmux", "split-window", "-v", "-t", "3", COMMANDS[4]]) # PANEL_5 생성 (인덱스 6?)
    subprocess.run(["tmux", "split-window", "-h", "-t", "6", COMMANDS[6]]) # PANEL_5 생성 (인덱스 6?)

    # # 패널 크기 조정 (실제 인덱스에 맞춰 수정해야 함)
    # subprocess.run(["tmux", "resize-pane", "-t", "1", "-r", "-500"]) # PANEL_1 (위로 50 픽셀)
    # subprocess.run(["tmux", "resize-pane", "-t", "1", "-D", "-1500"]) # PANEL_1 (위로 50 픽셀)
    # subprocess.run(["tmux", "resize-pane", "-t", "3", "-u", "0"]) # PANEL_2 (오른쪽으로 100 픽셀)
    # subprocess.run(["tmux", "resize-pane", "-t", "4", "-u", "100"])  # PANEL_3 (왼쪽으로 80 픽셀)
    # subprocess.run(["tmux", "resize-pane", "-t", "5", "-u", "100"])  # PANEL_4 (아래로 60 픽셀)
    # subprocess.run(["tmux", "resize-pane", "-t", "6", "-U", "0"])  # PANEL_5 (위로 70 픽셀)
    # subprocess.run(["tmux", "resize-pane", "-t", "2", "-U", "0"])  # PANEL_6 (아래로 90 픽셀)

    # subprocess.run(["tmux", "select-pane", "-t", "1"])

    try:
        # 세션에 붙기
        subprocess.run(["tmux", "attach-session", "-t", SESSION_NAME])
    finally:
        kill_tmux_session()

if __name__ == "__main__":
    main()