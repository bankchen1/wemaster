#!/usr/bin/env bash
set -euo pipefail

# 日志控制脚本 - 限流与落盘
mkdir -p logs

run() {
  local name="$1"
  shift
  local log="logs/${name}.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  echo "[$timestamp] [START] $name" | tee -a "$log"
  
  # 执行命令并捕获输出
  if ("$@" 2>&1 | stdbuf -oL -eL tee -a "$log"); then
    echo "[$timestamp] [OK] $name" | tee -a "$log"
    return 0
  else
    local exit_code=$?
    echo "[$timestamp] [FAIL] $name (exit: $exit_code)" | tee -a "$log"
    return $exit_code
  fi
}

tailf() {
  local log_file="$1"
  if [[ -f "logs/${log_file}.log" ]]; then
    tail -n 200 -f "logs/${log_file}.log" || true
  else
    echo "日志文件不存在: logs/${log_file}.log"
  fi
}

# 控制台仅显示尾部200行
console_tail() {
  local log_file="$1"
  if [[ -f "logs/${log_file}.log" ]]; then
    echo "=== 最近200行日志: ${log_file} ==="
    tail -n 200 "logs/${log_file}.log"
  else
    echo "日志文件不存在: logs/${log_file}.log"
  fi
}

# 二进制输出强制落盘
binary_run() {
  local name="$1"
  shift
  local log="logs/${name}.bin.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  echo "[$timestamp] [BINARY_START] $name" | tee -a "$log"
  
  # 二进制输出重定向，不上屏
  if ("$@" >> "$log" 2>&1); then
    echo "[$timestamp] [BINARY_OK] $name" | tee -a "$log"
    return 0
  else
    local exit_code=$?
    echo "[$timestamp] [BINARY_FAIL] $name (exit: $exit_code)" | tee -a "$log"
    return $exit_code
  fi
}

# 失败自动重试并标记原因
retry_run() {
  local name="$1"
  local max_retries="$2"
  shift 2
  local retry_count=0
  
  while [ $retry_count -lt $max_retries ]; do
    if run "$name" "$@"; then
      return 0
    fi
    retry_count=$((retry_count + 1))
    echo "[$name] 重试 $retry_count/$max_retries"
    sleep 2
  done
  
  echo "[$name] 达到最大重试次数 $max_retries，标记为失败"
  return 1
}

# 导出函数供其他脚本使用
export -f run
export -f tailf
export -f console_tail
export -f binary_run
export -f retry_run