import os
import io
import base64
import tempfile
import numpy as np
import librosa
from scipy.signal import butter, filtfilt
import matplotlib
matplotlib.use('Agg')  # Headless backend for web servers
import matplotlib.pyplot as plt

# ----------------- Configuration -----------------
TARGET_SR = 2000
DURATION_SEC = 5.0
TARGET_SAMPLES = int(TARGET_SR * DURATION_SEC)
LOWCUT = 25.0
HIGHCUT = 400.0
N_MELS = 64
N_FFT = 256
HOP_LENGTH = 128


def butter_bandpass(lowcut: float, highcut: float, fs: int, order: int = 4):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return b, a


def apply_bandpass_filter(audio: np.ndarray, fs: int = TARGET_SR) -> np.ndarray:
    b, a = butter_bandpass(LOWCUT, HIGHCUT, fs=fs, order=4)
    filtered = filtfilt(b, a, audio)
    max_val = np.max(np.abs(filtered))
    if max_val > 0:
        filtered = filtered / max_val
    return filtered


def preprocess_heart_audio(file_bytes: bytes) -> np.ndarray:
    """
    Cleans heart sound audio using a safe temporary file to prevent Librosa freeze:
    resamples to 2000Hz mono, applies 25-400Hz bandpass, aligns to 5 seconds,
    and computes a standardized Log-Mel Spectrogram.
    Output shape: (1, 64, 79, 1)
    """
    # 1. In-memory freeze se bachne ke liye bytes ko temp file me save karein
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(file_bytes)
        temp_path = temp_audio.name

    try:
        # 2. File path se safely load karein
        audio, sr = librosa.load(temp_path, sr=TARGET_SR, mono=True)
    finally:
        # 3. Memory leak aur leftover files avoid karne ke liye delete karein
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # 4. Bandpass filter apply karein
    filtered_audio = apply_bandpass_filter(audio, fs=TARGET_SR)

    # 5. Exactly 5.0 seconds (TARGET_SAMPLES) align karein
    current_length = len(filtered_audio)
    if current_length < TARGET_SAMPLES:
        pad_width = TARGET_SAMPLES - current_length
        pad_left = pad_width // 2
        pad_right = pad_width - pad_left
        padded_audio = np.pad(filtered_audio, (pad_left, pad_right), mode='constant')
    else:
        start = (current_length - TARGET_SAMPLES) // 2
        padded_audio = filtered_audio[start:start + TARGET_SAMPLES]

    # 6. Mel-spectrogram generation
    mel_spec = librosa.feature.melspectrogram(
        y=padded_audio,
        sr=TARGET_SR,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        n_mels=N_MELS,
        power=2.0
    )
    log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)

    # 7. Standardization
    spec_mean = np.mean(log_mel_spec)
    spec_std = np.std(log_mel_spec) + 1e-8
    norm_spec = (log_mel_spec - spec_mean) / spec_std

    return np.expand_dims(norm_spec, axis=(0, -1)).astype(np.float32)


def generate_spectrogram_image(log_mel_spec: np.ndarray) -> str:
    """
    Renders 2D log mel-spectrogram to a base64 encoded PNG data URI string.
    Expects 2D input (e.g., norm_spec[0, :, :, 0] with shape [64, 79]).
    """
    fig, ax = plt.subplots(figsize=(6, 3), dpi=100)
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

    # Medical colormap rendering
    ax.imshow(log_mel_spec, aspect='auto', origin='lower', cmap='magma')
    ax.axis('off')
    plt.tight_layout(pad=0)

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0, facecolor=fig.get_facecolor())
    plt.close(fig)  # Prevents server memory leaks
    buf.seek(0)

    encoded = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{encoded}"