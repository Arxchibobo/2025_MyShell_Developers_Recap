@echo off
REM MyShell 2025 年度回顾 - Cloud Function 部署脚本 (Windows)
REM
REM 使用说明：
REM 1. 确保已安装 gcloud CLI 并登录
REM 2. 确保已设置正确的 GCP 项目
REM 3. 执行：deploy.bat YOUR_API_KEY
REM
REM 示例：deploy.bat AIzaSyC...

setlocal enabledelayedexpansion

echo ============================================
echo    MyShell 2025 Cloud Function 部署工具
echo ============================================
echo.

REM 检查参数
if "%1"=="" (
  echo [错误] 请提供 Gemini API Key
  echo.
  echo 使用方法：
  echo   deploy.bat YOUR_API_KEY
  echo.
  echo 示例：
  echo   deploy.bat AIzaSyC...
  exit /b 1
)

set API_KEY=%1
set PROJECT_ID=gen-lang-client-0260270819
set REGION=europe-west1
set FUNCTION_NAME=generate-content

echo [配置] 部署信息：
echo   项目 ID: %PROJECT_ID%
echo   区域: %REGION%
echo   函数名称: %FUNCTION_NAME%
echo.

REM 确认部署
set /p CONFIRM="确认部署？(y/n): "
if /i not "%CONFIRM%"=="y" (
  echo [已取消] 部署已取消
  exit /b 0
)

echo.
echo [开始] 部署 Cloud Function...
echo.

REM 部署 Cloud Function
gcloud functions deploy %FUNCTION_NAME% ^
  --gen2 ^
  --runtime=nodejs20 ^
  --region=%REGION% ^
  --source=. ^
  --entry-point=generateContent ^
  --trigger-http ^
  --allow-unauthenticated ^
  --set-env-vars GEMINI_API_KEY=%API_KEY% ^
  --memory=512MB ^
  --timeout=60s ^
  --max-instances=10 ^
  --project=%PROJECT_ID%

if errorlevel 1 (
  echo.
  echo [失败] 部署失败！
  exit /b 1
)

echo.
echo ============================================
echo [成功] 部署完成！
echo ============================================
echo.
echo [URL] 函数地址：
echo   https://%REGION%-%PROJECT_ID%.cloudfunctions.net/%FUNCTION_NAME%
echo.
echo [日志] 查看日志命令：
echo   gcloud functions logs read %FUNCTION_NAME% --region=%REGION% --project=%PROJECT_ID%
echo.
echo [测试] 测试调用示例：
echo   curl -X POST https://%REGION%-%PROJECT_ID%.cloudfunctions.net/%FUNCTION_NAME% ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"type\":\"thanks-letter\",\"developerName\":\"测试\",\"botCount\":10,\"topCategory\":\"AI\"}"
echo.
echo ============================================
echo 下一步：修改前端代码调用此 URL
echo ============================================

endlocal
