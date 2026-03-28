FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm install

# Генерируем Prisma клиент
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Открываем порт
EXPOSE 3002

# Запускаем миграции и стартуем
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
