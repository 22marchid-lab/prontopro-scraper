FROM mcr.microsoft.com/playwright:v1.58.2-jammy
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
