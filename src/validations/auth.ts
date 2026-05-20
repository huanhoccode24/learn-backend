import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên tài khoản' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' }),
  isCollaborator: z.boolean().optional(),
});
