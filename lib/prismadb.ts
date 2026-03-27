import { PrismaClient } from "@prisma/client";

// 1. إضافة متغير global لكي لا يختفي عند التحديث
declare global {
  var prisma: PrismaClient | undefined;
}

// 2. إذا كان المتغير موجوداً استخدمه، وإلا أنشئ واحداً جديداً
const prismadb = globalThis.prisma || new PrismaClient();

// 3. في وضع التطوير فقط، احفظ الاتصال في global
// (في الـ Production لا نحتاج هذا لأن السيرفر لا يعمل Hot Reload)
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;
