declare module 'promptpay-qr' {
  export default function generate(id: string, options: { amount?: number }): string;
}
