@echo off
cd /d C:\Users\Serkan\Desktop\soruyükleyici
echo Sunucu basliyor...
echo Telefondan ac: http://192.168.1.45:8080
echo CMD penceresini KAPATMAYIN!
python -m http.server 8080
pause