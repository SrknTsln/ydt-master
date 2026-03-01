@echo off
cd /d "C:\Users\Serkan\Desktop\YDT Master - DENEY - Kopya"
echo Sunucu basliyor...
echo Telefondan ac: http://192.168.1.45:8081
echo CMD penceresini KAPATMAYIN!
python -m http.server 8081
pause