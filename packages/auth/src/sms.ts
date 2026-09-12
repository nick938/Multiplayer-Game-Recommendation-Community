/**
 * SMS provider adapter (plan §42, §44). The CN deployment's phone login rides
 * on this interface; the global build never loads an SMS provider.
 * Actual 阿里云短信 integration ships with the CN compliance work — the stub
 * logs instead of sending so local dev can flow end-to-end without secrets.
 */
export interface SmsProvider {
  /** Send a verification code. Returns provider message id when accepted. */
  sendVerificationCode(phone: string, code: string): Promise<{ id: string }>
}

class ConsoleSmsProvider implements SmsProvider {
  async sendVerificationCode(phone: string, code: string) {
    console.info(`[sms:stub] code for ${phone.slice(0, 3)}****${phone.slice(-4)}: ${code}`)
    return { id: `stub-${Date.now()}` }
  }
}

export function getSmsProvider(): SmsProvider | null {
  if (process.env.ALIYUN_SMS_ACCESS_KEY_ID && process.env.ALIYUN_SMS_ACCESS_KEY_SECRET) {
    // TODO(cn): implement Aliyun SMS adapter when the CN deployment starts.
    return new ConsoleSmsProvider()
  }
  return new ConsoleSmsProvider()
}
