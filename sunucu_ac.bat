@echo off
cd /d "C:\Users\Serkan\Desktop\YDT Master - DENEY - Kopya"

:: Yerel IP adresini bul (169.254 APIPA adreslerini atla)
set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169.254"') do (
    if not defined LOCAL_IP set RAW=%%a
)
for /f "tokens=1" %%b in ("%RAW%") do set LOCAL_IP=%%b

echo.
echo  ================================================
echo   YDT MASTER PRO - Yerel Sunucu
echo  ================================================
echo.
echo   Bilgisayardan  :  http://localhost
echo   Telefondan     :  http://%LOCAL_IP%
echo.
echo   NOT: Telefon ve PC ayni Wi-Fi'de olmali!
echo  ================================================
echo.

start "" "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://%LOCAL_IP%"

echo   QR kod tarayicida acildi - telefonla tarayabilirsiniz.
echo.
echo   Sunucu basliyor - bu pencereyi KAPATMAYIN!
echo   Durdurmak icin CTRL+C
echo.

python -m http.server 80
pause
