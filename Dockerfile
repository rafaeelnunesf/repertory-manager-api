

FROM node:16

WORKDIR /usr/src/

COPY . . 

EXPOSE 5000

RUN npm i --force
RUN npx prisma generate

CMD ["npm", "run", "dev-migrate"]