# 이 스크립트는 Docker → 로컬 및 로컬 → Docker 데이터 이전을 자동화합니다. PostgreSQL, Redis, MinIO에 대해 백업과 복원 작업을 처리합니다.

# 우리는 Python의 subprocess 모듈을 사용하여 명령어를 실행하고, 파일을 다루기 위해 shutil을 사용합니다.스크립트 실행:

# Docker → 로컬 데이터 이동:
# python migration_script.py docker_to_local

# 로컬 → Docker 데이터 이동:
# python migration_script.py local_to_docker

# postgres_backup()과 postgres_restore() 함수는 PostgreSQL 데이터를 pg_dump로 백업하고, pg_restore로 복원합니다.
# redis_backup()과 redis_restore() 함수는 Redis 데이터의 dump.rdb 파일을 복사하여 백업하고 복원합니다.
# minio_backup()과 minio_restore() 함수는 MinIO 데이터를 복사하여 백업하고 복원합니다.

# 사용법:
# 명령어 인자에 docker_to_local 또는 local_to_docker를 지정하여 데이터를 이동합니다.
# 필요사항
# Python 3가 설치되어 있어야 합니다.
# docker 명령어가 설치되고 실행 가능한 환경이어야 합니다.
# Docker 컨테이너 이름을 정확하게 설정해야 합니다.
# pg_dump와 pg_restore 명령어는 로컬에 설치되어 있어야 합니다.
# 이 스크립트는 Docker → 로컬 또는 로컬 → Docker 데이터 이동을 자동화할 수 있으며, 백업과 복원에 필요한 작업을 효율적으로 처리합니다.

import subprocess
import shutil
import os
import sys

# 설정 부분
POSTGRES_CONTAINER = "cointracker-postgres-1"
REDIS_CONTAINER = "cointracker-redis-1"
MINIO_CONTAINER = "cointracker-minio-1"

LOCAL_PG_DATA = "./local_pg_data"
LOCAL_REDIS_DATA = "./local_redis_data"
LOCAL_MINIO_DATA = "./local_minio_data"

# 도커 명령어 실행 함수
def run_command(command):
    """Shell 명령어 실행"""
    result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr.decode())
        sys.exit(1)
    return result.stdout.decode()

# PostgreSQL 백업 및 복원 함수
def postgres_backup():
    print("Backing up PostgreSQL from Docker...")
    # PostgreSQL 백업
    run_command(f"docker exec -t {POSTGRES_CONTAINER} pg_dump -U admin -F c -d coindata -f /tmp/db.dump")
    run_command(f"docker cp {POSTGRES_CONTAINER}:/tmp/db.dump ./local_pg_data/db.dump")
    print("PostgreSQL backup complete.")

def postgres_restore():
    print("Restoring PostgreSQL to Docker...")
    # PostgreSQL 복원
    run_command(f"pg_restore -U admin -d coindata -F c ./local_pg_data/db.dump")
    print("PostgreSQL restore complete.")

# Redis 백업 및 복원 함수
def redis_backup():
    print("Backing up Redis from Docker...")

    # Redis 내부 경로를 명확히 지정
    redis_dump_path = "/data/dump.rdb"  # 또는 실제 사용하는 경로 확인
    local_dump_path = os.path.join(LOCAL_REDIS_DATA, "dump.rdb")

    # 로컬 백업 폴더가 없으면 생성
    os.makedirs(LOCAL_REDIS_DATA, exist_ok=True)

    # Redis 컨테이너에서 파일 복사
    run_command(f"docker cp {REDIS_CONTAINER}:{redis_dump_path} {local_dump_path}")
    print("Redis backup complete.")


def redis_restore():
    print("Restoring Redis to Docker...")
    # Redis 복원
    shutil.copy(os.path.join(LOCAL_REDIS_DATA, "dump.rdb"), "/data/dump.rdb")
    run_command(f"docker exec {REDIS_CONTAINER} redis-server --appendonly yes")
    print("Redis restore complete.")

# MinIO 백업 및 복원 함수
def minio_backup():
    print("Backing up MinIO from Docker...")
    # MinIO 데이터 디렉토리 복사
    run_command(f"docker cp {MINIO_CONTAINER}:/data ./local_minio_data")
    print("MinIO backup complete.")

def minio_restore():
    print("Restoring MinIO to Docker...")
    # MinIO 복원
    run_command(f"docker cp ./local_minio_data/ {MINIO_CONTAINER}:/data")
    run_command(f"docker exec {MINIO_CONTAINER} minio server /data --console-address ':9001'")
    print("MinIO restore complete.")

# 데이터 이동 및 환경 전환 (도커 → 로컬 / 로컬 → 도커)
def move_data(direction):
    if direction == "docker_to_local":
        print("Moving data from Docker to Local...")
        postgres_backup()
        redis_backup()
        minio_backup()
        print("Data move from Docker to Local complete.")
    
    elif direction == "local_to_docker":
        print("Moving data from Local to Docker...")
        postgres_restore()
        redis_restore()
        minio_restore()
        print("Data move from Local to Docker complete.")
    else:
        print("Invalid direction specified. Please use 'docker_to_local' or 'local_to_docker'.")
        sys.exit(1)

# Main
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python migration_script.py [docker_to_local | local_to_docker]")
        sys.exit(1)

    direction = sys.argv[1]
    move_data(direction)
