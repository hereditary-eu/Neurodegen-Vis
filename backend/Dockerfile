# context: repo root
FROM python:3.12-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:0.13.9 /uv /bin/uv

WORKDIR /app
ENV UV_PYTHON_DOWNLOADS=never UV_COMPILE_BYTECODE=1
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --only-group backend
ENV PATH="/app/.venv/bin:$PATH"

COPY backend .

EXPOSE 8000
ENV DATA_DIR=/app/data
CMD [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
