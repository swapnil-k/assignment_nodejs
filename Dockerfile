FROM node:14.19-alpine

ENV NODE_ENV production

WORKDIR /app

COPY ./ ./

ENV TIMEOUT 10
RUN npm install
EXPOSE 80
CMD ["node" , "index.js"]
#CMD ["sleep", "infinity"]
