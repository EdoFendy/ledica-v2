// Quale torcia reale mostrare per uno spessore di parete (mm): laser fino a 0,5, combo fino a 3,00, plasma oltre.
export type TorchMode = "laser" | "combo" | "keyhole";
export const torchMode = (v: number): TorchMode => (v <= 0.5 ? "laser" : v <= 3 ? "combo" : "keyhole");
