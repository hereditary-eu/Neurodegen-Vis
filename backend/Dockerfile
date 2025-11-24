FROM python:3.11-bookworm

WORKDIR /app
ADD requirements.txt /app
RUN pip install -r requirements.txt

WORKDIR /app

ADD . /app

WORKDIR /app

EXPOSE 8000
ENV DATA_DIR=/app/data
CMD [ "python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
