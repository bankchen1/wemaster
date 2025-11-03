#!/bin/bash

# 环境切换脚本
set -e

ENVIRONMENT=${1:-test}

echo "切换到环境: $ENVIRONMENT"

case $ENVIRONMENT in
    "test")
        export DOPPLER_PROJECT="wemaster"
        export DOPPLER_CONFIG="test"
        ;;
    "staging")
        export DOPPLER_PROJECT="wemaster"
        export DOPPLER_CONFIG="staging"
        ;;
    "production")
        export DOPPLER_PROJECT="wemaster"
        export DOPPLER_CONFIG="production"
        ;;
    *)
        echo "错误: 未知环境 '$ENVIRONMENT'"
        echo "可用环境: test, staging, production"
        exit 1
        ;;
esac

echo "已切换到 $ENVIRONMENT 环境"
echo "项目: $DOPPLER_PROJECT"
echo "配置: $DOPPLER_CONFIG"

# 导出环境变量到当前 shell
if command -v doppler &> /dev/null && [ -n "$DOPPLER_TOKEN" ]; then
    eval $(doppler secrets download --format=env)
    echo "Doppler 环境变量已加载"
else
    echo "使用本地环境变量文件"
    case $ENVIRONMENT in
        "test")
            if [ -f .env.doppler ]; then
                export $(cat .env.doppler | grep -v '^#' | xargs)
                echo "测试环境变量已加载"
            fi
            ;;
        "staging")
            if [ -f .env.staging ]; then
                export $(cat .env.staging | grep -v '^#' | xargs)
                echo "Staging 环境变量已加载"
            fi
            ;;
        "production")
            if [ -f .env.production ]; then
                export $(cat .env.production | grep -v '^#' | xargs)
                echo "生产环境变量已加载"
            fi
            ;;
    esac
fi