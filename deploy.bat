@echo off
chcp 65001 > nul
SETLOCAL ENABLEDELAYEDEXPANSION

REM ===========================================================================
REM Configurações
REM ===========================================================================
SET DEST_DIR=C:\inetpub\app-21-web
SET SOURCE_WEB_CONFIG=web.config

REM ===========================================================================
REM Estilos (cores ANSI)
REM ===========================================================================
set "C_RESET=[0m"
set "C_TITLE=[1;96m"
set "C_SECTION=[1;94m"
set "C_OK=[1;92m"
set "C_ERR=[1;91m"
set "C_WARN=[1;93m"
set "C_INFO=[90m"
set "C_TEXT=[1;97m"

cls

echo.
echo %C_TITLE%╔══════════════════════════════════════════════════════════════════════╗%C_RESET%
echo %C_TITLE%║                    Deploy Next.js para IIS - v1.0                     ║%C_RESET%
echo %C_TITLE%╚══════════════════════════════════════════════════════════════════════╝%C_RESET%
echo.
echo %C_TEXT%Destino final:%C_RESET% %DEST_DIR%
echo.


REM ===========================================================================
REM 1. BUILD
REM ===========================================================================
echo %C_SECTION%────────────────────────── 1. Buildando o projeto ─────────────────────────%C_RESET%

call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo %C_ERR%[ERRO] Falha no build. Corrija erros e tente novamente.%C_RESET%
    pause
    exit /b 1
)
echo %C_OK%[OK] Build concluído.%C_RESET%
echo.


REM ===========================================================================
REM 2. PREPARAR DIRETÓRIO
REM ===========================================================================
echo %C_SECTION%────────────────────────── 2. Preparando diretório ───────────────────────%C_RESET%

IF NOT EXIST %DEST_DIR% MKDIR %DEST_DIR%
IF NOT EXIST %DEST_DIR% (
    echo %C_ERR%[ERRO] Não foi possível criar o diretório de destino.%C_RESET%
    pause
    exit /b 1
)

echo %C_OK%[OK] Diretório OK.%C_RESET%
echo.


REM ===========================================================================
REM 3. COPIAR .ENV (SE NECESSÁRIO)
REM ===========================================================================
echo %C_SECTION%────────────────────────── 3. Preparando variáveis de ambiente ─────────────%C_RESET%

IF EXIST .env.production (
    echo %C_INFO%Copiando .env.production para standalone...%C_RESET%
    COPY .env.production .next\standalone\.env /Y > nul
    echo %C_OK%[OK] .env copiado para standalone.%C_RESET%
) ELSE IF EXIST .env.local (
    echo %C_INFO%Copiando .env.local para standalone...%C_RESET%
    COPY .env.local .next\standalone\.env /Y > nul
    echo %C_OK%[OK] .env copiado para standalone.%C_RESET%
) ELSE IF EXIST .env (
    echo %C_INFO%Copiando .env para standalone...%C_RESET%
    COPY .env .next\standalone\.env /Y > nul
    echo %C_OK%[OK] .env copiado para standalone.%C_RESET%
) ELSE (
    echo %C_WARN%[AVISO] Nenhum arquivo .env encontrado - usando variáveis do web.config.%C_RESET%
)

echo.


REM ===========================================================================
REM 4. COPIAR ARQUIVOS ESTÁTICOS PARA STANDALONE (ANTES DE COPIAR)
REM ===========================================================================
echo %C_SECTION%────────────────────────── 4. Preparando standalone ─────────────────────────%C_RESET%

echo %C_INFO%Copiando arquivos estáticos para dentro do standalone...%C_RESET%
xcopy .next\static .next\standalone\.next\static\ /E /I /Y > nul
IF EXIST public (
    xcopy public .next\standalone\public\ /E /I /Y > nul
)
echo %C_OK%[OK] Arquivos estáticos preparados no standalone.%C_RESET%
echo.


REM ===========================================================================
REM 5. COPIAR BUILD STANDALONE COMPLETO
REM ===========================================================================
echo %C_SECTION%────────────────────────── 5. Copiando build standalone ──────────────────────%C_RESET%

xcopy .next\standalone %DEST_DIR%\ /E /I /Y > nul
echo %C_OK%[OK] Build standalone completo copiado.%C_RESET%
echo.


REM ===========================================================================
REM 6. VERIFICAÇÃO FINAL
REM ===========================================================================
echo %C_SECTION%────────────────────────── 6. Verificando estrutura ──────────────────────────%C_RESET%

IF EXIST %DEST_DIR%\.next\static (
    echo %C_OK%[OK] .next/static presente.%C_RESET%
) ELSE (
    echo %C_ERR%[ERRO] .next/static não foi copiado!%C_RESET%
)

IF EXIST %DEST_DIR%\server.js (
    echo %C_OK%[OK] server.js presente.%C_RESET%
) ELSE (
    echo %C_ERR%[ERRO] server.js não foi copiado!%C_RESET%
)
echo.


REM ===========================================================================
REM 7. COPIAR / GERAR WEB.CONFIG
REM ===========================================================================
echo %C_SECTION%────────────────────────── 7. Copiando web.config ─────────────────────────%C_RESET%

IF NOT EXIST %SOURCE_WEB_CONFIG% (
    echo %C_WARN%[AVISO] web.config não encontrado. Criando padrão...%C_RESET%
    (
        echo ^<?xml version="1.0" encoding="UTF-8"?^>
        echo ^<configuration^>
        echo   ^<system.webServer^>
        echo     ^<handlers^>
        echo       ^<add name="httpPlatformHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" requireAccess="Script" /^>
        echo     ^</handlers^>
        echo     ^<httpPlatform stdoutLogEnabled="true" stdoutLogFile=".\node.log" startupTimeLimit="20" processPath="C:\Program Files\nodejs\node.exe" arguments="server.js"^>
        echo       ^<environmentVariables^>
        echo         ^<environmentVariable name="PORT" value="%%HTTP_PLATFORM_PORT%%" /^>
        echo         ^<environmentVariable name="NODE_ENV" value="production" /^>
        echo       ^</environmentVariables^>
        echo     ^</httpPlatform^>
        echo   ^</system.webServer^>
        echo ^</configuration^>
    ) > %SOURCE_WEB_CONFIG%
)

COPY %SOURCE_WEB_CONFIG% %DEST_DIR%\ /Y > nul
echo %C_OK%[OK] web.config pronto.%C_RESET%
echo.


REM ===========================================================================
REM 8. OBSERVAÇÃO SOBRE SERVER.JS
REM ===========================================================================
echo %C_SECTION%────────────────────────── 8. Standalone mode ─────────────────────────────────%C_RESET%
echo %C_INFO%O build standalone já inclui um server.js otimizado.%C_RESET%
echo %C_INFO%Execute: node server.js no diretório de deploy.%C_RESET%
echo.


REM ===========================================================================
REM FINAL
REM ===========================================================================
echo %C_TITLE%╔══════════════════════════════════════════════════════════════════════╗%C_RESET%
echo %C_TITLE%║                    ✔ DEPLOY CONCLUÍDO COM SUCESSO ✔                   ║%C_RESET%
echo %C_TITLE%╚══════════════════════════════════════════════════════════════════════╝%C_RESET%
echo.
echo %C_INFO%Reinicie o App Pool no IIS para aplicar as mudanças.%C_RESET%
echo.
pause