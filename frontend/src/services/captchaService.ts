type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loading: Promise<void> | null = null;

/** Obtains a reCAPTCHA v3 token; backend remains the authority that verifies it. */
export async function getCaptchaToken(action: string): Promise<string | undefined> {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();
  if (!siteKey) return undefined;

  if (!window.grecaptcha) {
    loading ??= loadScript(siteKey);
    await loading;
  }
  const captcha = window.grecaptcha;
  if (!captcha) throw new Error("Không thể khởi tạo CAPTCHA");
  await new Promise<void>((resolve) => captcha.ready(resolve));
  return captcha.execute(siteKey, { action });
}

function loadScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không thể tải CAPTCHA"));
    document.head.appendChild(script);
  });
}
