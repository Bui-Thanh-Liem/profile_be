# CORS (Cross-origin resource sharing)
- Access-Control-Allow-Methods
- Access-Control-Allow-Origin
- CORS là một cơ chế bảo mật của trình duyệt để kiểm soát xem một trang web có được phép thực hiện các request đến domain khác (cross-origin) hay không.

# CSRF (Cross site request forgery)
- CSRF là tấn công lợi dụng session hoặc cookie đã tồn tại. Kẻ tấn công dụ người dùng truy cập vào trang độc hại để gửi các request ngầm đến server mà người dùng đã đăng nhập.
- SameSite cookies -> jwt với cookie

# xss (Cross site scripting)
- XSS là tấn công chèn mã JavaScript độc hại vào trang web. Khi người dùng khác truy cập, mã đó sẽ được thực thi.
- Escape -> express-validate

# DDoS
- DDoS gửi hàng loạt yêu cầu đến server để làm nó quá tải hoặc ngừng hoạt động.
- ufw, Cloudflare