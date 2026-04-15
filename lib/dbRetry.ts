// utils/dbRetry.ts

export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,      // عدد مرات المحاولة
  delayMs: number = 2000       // وقت الانتظار بين كل محاولة (2000 ملي ثانية = ثانيتين)
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // بنحاول ننفذ العملية (زي جلب المنتجات)
      return await operation();
    } catch (error) {
      // لو دي آخر محاولة وبرضه فشلت، هنطلع الإيرور النهائي
      if (attempt === maxRetries) {
        console.error(`Database operation failed after ${maxRetries} attempts.`);
        throw error;
      }
      
      // لو لسه في محاولات، بنطبع تحذير في الكواليس ونستنى شوية
      console.warn(`Database sleep detected. Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Unreachable code");
}
