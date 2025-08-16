"use server";

import { z } from 'zod';
import { cookies } from 'next/headers';
import { JWTAuth } from '@/lib/auth/jwt';
import { db } from '@/lib/db/db';
import { watchlists, watchlistItems, priceAlerts, tradingAccounts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

interface ActionResult<T=any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

async function getUserId(): Promise<string|null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    const payload = await JWTAuth.verifyAccessToken(token);
    return (payload as any)?.userId || (payload as any)?.sub || null;
  } catch {
    return null;
  }
}

// Watchlists
const createWatchlistSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  description: z.string().max(500).optional(),
});

export async function getWatchlistsAction(): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success:false, message:'Not authenticated' };
  try {
    const list = await db.select().from(watchlists).where(eq(watchlists.userId, userId)).orderBy(desc(watchlists.createdAt));
    return { success:true, message:'OK', data:list };
  } catch (e) {
    console.error('getWatchlistsAction error', e);
    return { success:false, message:'Failed to load watchlists' };
  }
}

export async function createWatchlistAction(formData: FormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success:false, message:'Not authenticated' };
  try {
    const raw = { name: formData.get('name') as string, description: formData.get('description') as string };
    const data = createWatchlistSchema.parse(raw);
    const [created] = await db.insert(watchlists).values({ userId, name: data.name, description: data.description, isDefault:false, isPublic:false }).returning();
    return { success:true, message:'Created', data:created };
  } catch (e:any) {
    if (e instanceof z.ZodError) {
      const raw = e.flatten().fieldErrors;
      const cleaned: Record<string, string[]> = Object.fromEntries(
        Object.entries(raw).filter(([,v]) => v && v.length).map(([k,v]) => [k, v as string[]])
      );
      return { success:false, message:'Validation failed', errors: cleaned };
    }
    console.error('createWatchlistAction error', e);
    return { success:false, message:'Failed to create watchlist' };
  }
}

// Price Alerts
const createPriceAlertSchema = z.object({
  symbol: z.string().min(1, 'Symbol required').max(20),
  targetPrice: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Invalid price'),
});

export async function getPriceAlertsAction(): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success:false, message:'Not authenticated' };
  try {
    const list = await db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId)).orderBy(desc(priceAlerts.createdAt));
    return { success:true, message:'OK', data:list };
  } catch (e) {
    console.error('getPriceAlertsAction error', e);
    return { success:false, message:'Failed to load price alerts' };
  }
}

export async function createPriceAlertAction(formData: FormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success:false, message:'Not authenticated' };
  try {
    const raw = { symbol: formData.get('symbol') as string, targetPrice: formData.get('targetPrice') as string };
    const data = createPriceAlertSchema.parse(raw);
    const [created] = await db.insert(priceAlerts).values({ userId, symbol: data.symbol.toUpperCase(), alertType:'above', targetPrice: data.targetPrice, isActive:true }).returning();
    return { success:true, message:'Created', data:created };
  } catch (e:any) {
    if (e instanceof z.ZodError) {
      const raw = e.flatten().fieldErrors;
      const cleaned: Record<string, string[]> = Object.fromEntries(
        Object.entries(raw).filter(([,v]) => v && v.length).map(([k,v]) => [k, v as string[]])
      );
      return { success:false, message:'Validation failed', errors: cleaned };
    }
    console.error('createPriceAlertAction error', e);
    return { success:false, message:'Failed to create price alert' };
  }
}

// Trading Accounts (basic create / list)
const createTradingAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name required').max(100),
  exchangeName: z.string().min(1, 'Exchange required').max(50),
  accountType: z.enum(['demo','live']),
});

export async function getTradingAccountsAction(): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success:false, message:'Not authenticated' };
  try {
    const list = await db.select().from(tradingAccounts).where(eq(tradingAccounts.userId, userId)).orderBy(desc(tradingAccounts.createdAt));
    return { success:true, message:'OK', data:list };
  } catch (e) {
    console.error('getTradingAccountsAction error', e);
    return { success:false, message:'Failed to load trading accounts' };
  }
}

export async function createTradingAccountAction(formData: FormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success:false, message:'Not authenticated' };
  try {
    const raw = { accountName: formData.get('accountName') as string, exchangeName: formData.get('exchangeName') as string, accountType: formData.get('accountType') as string };
    const data = createTradingAccountSchema.parse(raw);
    const [created] = await db.insert(tradingAccounts).values({ userId, accountName: data.accountName, exchangeName: data.exchangeName, accountType: data.accountType, isActive:true }).returning();
    return { success:true, message:'Created', data:created };
  } catch (e:any) {
    if (e instanceof z.ZodError) {
      const raw = e.flatten().fieldErrors;
      const cleaned: Record<string, string[]> = Object.fromEntries(
        Object.entries(raw).filter(([,v]) => v && v.length).map(([k,v]) => [k, v as string[]])
      );
      return { success:false, message:'Validation failed', errors: cleaned };
    }
    console.error('createTradingAccountAction error', e);
    return { success:false, message:'Failed to create trading account' };
  }
}
