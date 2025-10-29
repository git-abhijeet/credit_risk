# Python slim base
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/model_service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy service code and model artifacts (paths are relative to build context)
COPY backend/model_service /app
COPY models /app/models

ENV MODEL_PATH=/app/models/xgb_classifier.joblib
ENV ENCODER_PATH=/app/models/label_encoder.joblib
ENV FEATURES_PATH=/app/models/feature_columns.json
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]