import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CONSTANT_ENV } from 'src/constants';

@Injectable()
export class CookieService {
  setCookie({ name, value, res, maxAge }: { name: string; value: string; res: Response; maxAge: number }) {
    return res.cookie(name, value, {
      httpOnly: true, // Chỉ truy cập qua HTTP, tránh JS can thiệp, chống XSS (Cross-Site Scripting)
      secure: process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.PROD, // Chỉ gửi qua HTTPS nếu production
      maxAge: maxAge,
      sameSite: 'lax',
      // strict:  Ngăn chặn CSRF , trình duyệt tự động gửi cookie cho từng req (Cross-Site Request Forgery), app.com (BE) <-> app.com (FE)
      // lax:     Chỉ cho phép cookie gửi khi người dùng click vào link của trang bạn, (GET)
      // none:    Cho phép gửi cookie với mọi req
    });
  }

  clearCookie({ name, res }: { name: string; res: Response }) {
    return res.clearCookie(name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === CONSTANT_ENV.NODE_ENV.PROD,
    });
  }
}

// Set cookie CSRF
// const csrfToken = crypto.randomBytes(32).toString('hex');
// res.cookie(`${CONSTANT_TOKEN.CSRF_TOKEN_NAME_USER}`, csrfToken, {
//   httpOnly: false,
// });
