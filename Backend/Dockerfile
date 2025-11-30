# Usa una imagen base de Python ligera
FROM python:3.10-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia e instala las dependencias primero
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto por defecto de Flask
EXPOSE 5000

# Comando para iniciar la aplicación con Gunicorn (servidor de producción)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]