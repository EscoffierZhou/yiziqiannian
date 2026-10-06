import librosa
import soundfile as sf

# =========================
# 参数设置
# =========================
input_path = r"F:\desktop\配乐\ocean.wav"

speed = 2.0  # 倍速，可修改为任意数值

output_path = rf"F:\desktop\配乐\ocean{{{speed}}}倍速版本.wav"


# =========================
# 读取音频
# =========================
y, sr = librosa.load(
    input_path,
    sr=None,
    mono=False
)

print(f"原始采样率：{sr} Hz")
print(f"原始音频形状：{y.shape}")
print(f"调整倍速：{speed}x")


# =========================
# 调整倍速
# =========================
if y.ndim == 1:
    # 单声道
    y_stretched = librosa.effects.time_stretch(
        y,
        rate=speed
    )

else:
    # 多声道：逐个声道处理
    channels = []

    for channel in y:
        channel_stretched = librosa.effects.time_stretch(
            channel,
            rate=speed
        )
        channels.append(channel_stretched)

    # 重新组合声道
    y_stretched = librosa.util.stack(channels, axis=0)


# =========================
# 保存音频
# =========================
if y_stretched.ndim == 1:
    sf.write(
        output_path,
        y_stretched,
        sr
    )
else:
    # soundfile 的多声道格式：
    # [采样点数, 声道数]
    sf.write(
        output_path,
        y_stretched.T,
        sr
    )


print("处理完成！")
print(f"输出文件：{output_path}")