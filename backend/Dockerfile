FROM python:3.9.6
WORKDIR /backend
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 6060
COPY . .
CMD ["gunicorn", "wsgi:app", "-w 2", "-b 0.0.0.0:6060", "-t 30"]