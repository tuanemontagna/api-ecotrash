FROM node:18 

ENV API_PORT=3333
ENV POSTGRES_DB=ecotrash
ENV POSTGRES_USERNAME=ecotrsh
ENV POSTGRES_PASSWORD=yb96TZiWI7MoTEiCjmAVzR4hy8WjAnkC
ENV POSTGRES_HOST=dpg-d4m8au8gjchc73b42190-a.oregon-postgres.render.com
ENV POSTGRES_PORT=5432
ENV JWT_SECRET=teste123
ENV EMAIL_HOST=smtp.gmail.com
ENV EMAIL_PORT=587
ENV EMAIL_USER=tuanemontagna74@gmail.com
ENV EMAIL_PASS="cqoo smvj yica fpey"
ENV EMAIL_NAME=Ecotrash
ENV EMAIL_FROM=tuanemontagna74@gmail.com

COPY ./package.json ./
COPY ./src ./src
COPY ./uploads ./uploads

RUN npm install

EXPOSE 3333
CMD ["node", "./src/server.js"]
