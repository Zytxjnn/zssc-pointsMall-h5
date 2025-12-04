@echo off
echo 正在压缩 dist 文件夹...
set timestamp=%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
powershell -Command "Compress-Archive -Path dist -DestinationPath dist-%timestamp%.zip -Force"
if exist dist-*.zip (
    echo 压缩完成！压缩文件已生成。
    dir /b dist-*.zip
) else (
    echo 压缩失败，请手动压缩 dist 文件夹。
)
pause

