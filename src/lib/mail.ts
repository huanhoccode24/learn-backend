import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const mailOptions = {
    from: `"App Security" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Mã xác thực OTP của bạn là: ${token}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #2563eb; margin-top: 0;">Xác minh bảo mật</h2>
        <p style="color: #4b5563; font-size: 16px;">Chào bạn,</p>
        <p style="color: #4b5563; font-size: 16px;">Để hoàn tất quá trình đăng nhập, vui lòng sử dụng mã OTP 6 số dưới đây:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827;">${token}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">Mã này sẽ hết hạn trong vòng 5 phút. Vui lòng tuyệt đối không chia sẻ mã này để tránh mất tài khoản.</p>
      </div>
    `,
  };

  console.log('=====================================================');
  console.log(`[MÔ PHỎNG MAIL] Mã OTP của email ${email} là: ${token}`);
  console.log('=====================================================');

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Lỗi khi gửi mail:', error);
  }
};
