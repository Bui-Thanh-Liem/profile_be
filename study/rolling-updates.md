# Build và khởi động ứng dụng
docker-compose up --build -d

# Kiểm tra trạng thái
docker-compose ps

# Rebuild và deploy
docker-compose up --build --force-recreate --no-deps -d app

# Kiểm tra không có downtime, Mở terminal khác và chạy lệnh sau trong lúc cập nhật
while true; do curl http://localhost; sleep 1; done

# Xem log của các container
- docker-compose logs app
- docker-compose logs nginx
