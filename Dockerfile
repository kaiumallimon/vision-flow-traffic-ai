# ──────────────────────────────────────────────────────────────────
#  Vision Flow — FastAPI Backend
#  Base: Python 3.12 slim   Target: Azure Container Apps
# ──────────────────────────────────────────────────────────────────

FROM python:3.12-slim

# System libs required by OpenCV and OpenVINO
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install Python dependencies ────────────────────────────────────
# Copy only requirements first (layer cache: re-installs only when
# requirements change, not on every code change)
COPY fastapi_requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r fastapi_requirements.txt

# ── Copy application code ─────────────────────────────────────────
COPY app/ ./app/
COPY schema.prisma .

# ── Copy YOLO / OpenVINO model ────────────────────────────────────
COPY yolo11n_openvino_model/ ./yolo11n_openvino_model/

# ── Media directory (writable at runtime via Azure volume or tmpfs)
RUN mkdir -p media/uploads

# ── Non-root user for security ────────────────────────────────────
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# ── Single worker to keep memory under control ───────────────────
# WEB_CONCURRENCY defaults to 1; Azure Container Apps scales via
# replica count, not in-process workers.
ENV WEB_CONCURRENCY=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
