#!/usr/bin/env bash
set -euo pipefail

mmctl() {
  docker compose -p mattermost-ci -f compose.ci.yaml exec -T mattermost \
    /mattermost/bin/mmctl --local "$@"
}

mmctl user create --username employee1 --email employee1@example.test \
  --password "${MM_ADMIN_PASSWORD:?Set MM_ADMIN_PASSWORD}" \
  --system-admin --email-verified

mmctl user create --username studyuser312 --email studyuser312@example.test \
  --password "${MM_MEMBER_PASSWORD:?Set MM_MEMBER_PASSWORD}" \
  --email-verified

mmctl user create --username zhanyl.turtemirova1 --email target@example.test \
  --password "${MM_TARGET_PASSWORD:?Set MM_TARGET_PASSWORD}" \
  --email-verified

mmctl team create --name qa-playground --display-name qa-playground
mmctl team users add qa-playground employee1 studyuser312 zhanyl.turtemirova1