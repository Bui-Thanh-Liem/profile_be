# Sử dụng Node.js LTS làm base image
FROM node:22

# Tạo thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json trước để tận dụng Docker cache
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# 
RUN npm install --include=optional sharp

# Sao chép toàn bộ source code vào container
COPY . .

# Build ứng dụng NestJS
RUN npm run build && echo "✅ Build thành công!" || (echo "❌ Build thất bại!" && exit 1)

# 
RUN rm -rf ./src

# Mở cổng mà ứng dụng NestJS sẽ lắng nghe
EXPOSE 9000

# Khởi chạy ứng dụng
CMD ["npm", "run", "start:prod"]