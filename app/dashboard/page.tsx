'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRequireAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getRecentActivityAction } from '@/actions/profile';
import { getWatchlistsAction, createWatchlistAction, getPriceAlertsAction, createPriceAlertAction, getTradingAccountsAction, createTradingAccountAction } from '@/actions/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config as wagmiConfig } from '@/lib/wagmi';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setActivityLoading(true);
      getRecentActivityAction(8).then(res => {
        if (res.success && Array.isArray(res.data)) {
          setActivity(res.data as any[]);
        }
      }).finally(() => setActivityLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    try {
      const { logoutAction } = await import('@/actions/auth');
      await logoutAction();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-2">
              <InlineWalletButton />
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                {user.firstName && (
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                  </div>
                )}
                {user.username && (
                  <div>
                    <span className="font-medium">Username:</span> {user.username}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email Verified:</span>
                  <Badge variant={user.isEmailVerified ? 'default' : 'secondary'}>
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Member since:</span>{' '}
                  {new Date(user.createdAt!).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <WatchlistsModal />
                <PriceAlertsModal />
                <TradingAccountsModal />
                <Button className="w-full" variant="outline" onClick={() => router.push('/profile')}>
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Change Password
                </Button>
                <Button className="w-full" variant="outline">
                  Two-Factor Authentication
                </Button>
                <Button className="w-full" variant="outline">
                  Active Sessions
                </Button>
                <Button className="w-full" variant="outline">
                  Download Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="text-gray-500 text-center py-8">Loading activity...</div>
              ) : activity.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No recent activity to display</div>
              ) : (
                <ul className="space-y-3">
                  {activity.map(item => (
                    <li key={item.id} className="flex items-start justify-between border-b pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm">{item.action.replace(/_/g,' ')}</div>
                        {item.details && (
                          <div className="text-xs text-gray-500 max-w-md truncate">{JSON.stringify(item.details)}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Inline wallet connect button scoped to this page
const queryClient = new QueryClient();

function InlineWalletButton() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletButton />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();

  const metaMaskConnector = (connectors || []).find((c) => c.id === 'metaMask');
  const injectedConnector = (connectors || []).find((c) => c.id === 'injected');
  const selected = metaMaskConnector || injectedConnector || (connectors || [])[0];

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const hasEthereum = typeof window !== 'undefined' && (window as any).ethereum;

  if (!selected && !hasEthereum) {
    return (
      <Button
        variant="outline"
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
      >
        Install MetaMask
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button disabled variant="outline">
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        {shortAddr(address)} · Disconnect
      </Button>
    );
  }

  const handleConnectClick = async () => {
    try {
      if (selected) {
        await connect({ connector: selected });
        return;
      }
      const eth = (typeof window !== 'undefined' && (window as any).ethereum) || null;
      if (eth) {
        await eth.request({ method: 'eth_requestAccounts' });
        // Optional: refresh UI to reflect connected state
        if (typeof window !== 'undefined') window.location.reload();
        return;
      }
      window.open('https://metamask.io/download/', '_blank');
    } catch (e) {
      console.error('Connect click error:', e);
    }
  };

  return (
    <Button onClick={handleConnectClick}>
      Connect Wallet
    </Button>
  );
}

// --- Modal Components ---
function WatchlistsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getWatchlistsAction();
    if (res.success && Array.isArray(res.data)) setList(res.data as any[]);
    setLoading(false);
  };
  useEffect(() => { if (open) load(); }, [open]);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    await createWatchlistAction(formData);
    setCreating(false);
    load();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">View Watchlists</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Watchlists</DialogTitle>
        </DialogHeader>
        <form action={handleCreate} className="space-y-3 mb-4">
          <div>
            <Label htmlFor="wl-name">Name</Label>
            <Input id="wl-name" name="name" required />
          </div>
            <div>
            <Label htmlFor="wl-desc">Description</Label>
            <Input id="wl-desc" name="description" />
          </div>
          <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Add Watchlist'}</Button>
        </form>
        {loading ? <div className="text-sm text-gray-500">Loading...</div> : (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {list.map(w => (
              <li key={w.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{w.name}</div>
                {w.description && <div className="text-xs text-gray-500">{w.description}</div>}
                <div className="text-[10px] text-gray-400 mt-1">{new Date(w.createdAt).toLocaleString()}</div>
              </li>
            ))}
            {list.length === 0 && <li className="text-xs text-gray-500">No watchlists yet.</li>}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PriceAlertsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getPriceAlertsAction();
    if (res.success && Array.isArray(res.data)) setList(res.data as any[]);
    setLoading(false);
  };
  useEffect(() => { if (open) load(); }, [open]);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    await createPriceAlertAction(formData);
    setCreating(false);
    load();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">Price Alerts</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Price Alerts</DialogTitle>
        </DialogHeader>
        <form action={handleCreate} className="space-y-3 mb-4">
          <div>
            <Label htmlFor="pa-symbol">Symbol</Label>
            <Input id="pa-symbol" name="symbol" placeholder="BTCUSDT" required />
          </div>
          <div>
            <Label htmlFor="pa-target">Target Price</Label>
            <Input id="pa-target" name="targetPrice" type="number" step="0.0001" min="0" required />
          </div>
          <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Add Alert'}</Button>
        </form>
        {loading ? <div className="text-sm text-gray-500">Loading...</div> : (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {list.map(a => (
              <li key={a.id} className="border rounded p-2 text-sm flex justify-between">
                <div>
                  <div className="font-medium">{a.symbol}</div>
                  <div className="text-xs text-gray-500">Target: {a.targetPrice}</div>
                </div>
                <div className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleString()}</div>
              </li>
            ))}
            {list.length === 0 && <li className="text-xs text-gray-500">No alerts yet.</li>}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TradingAccountsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getTradingAccountsAction();
    if (res.success && Array.isArray(res.data)) setList(res.data as any[]);
    setLoading(false);
  };
  useEffect(() => { if (open) load(); }, [open]);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    await createTradingAccountAction(formData);
    setCreating(false);
    load();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">Trading Accounts</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trading Accounts</DialogTitle>
        </DialogHeader>
        <form action={handleCreate} className="space-y-3 mb-4">
          <div>
            <Label htmlFor="ta-name">Account Name</Label>
            <Input id="ta-name" name="accountName" required />
          </div>
          <div>
            <Label htmlFor="ta-exchange">Exchange</Label>
            <Input id="ta-exchange" name="exchangeName" placeholder="Binance" required />
          </div>
          <div>
            <Label htmlFor="ta-type">Type</Label>
            <select id="ta-type" name="accountType" className="w-full border rounded h-9 px-2 text-sm" required>
              <option value="demo">Demo</option>
              <option value="live">Live</option>
            </select>
          </div>
          <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Add Account'}</Button>
        </form>
        {loading ? <div className="text-sm text-gray-500">Loading...</div> : (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {list.map(acc => (
              <li key={acc.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{acc.accountName || '(unnamed)'}</div>
                <div className="text-xs text-gray-500">{acc.exchangeName} • {acc.accountType}</div>
                <div className="text-[10px] text-gray-400 mt-1">{new Date(acc.createdAt).toLocaleString()}</div>
              </li>
            ))}
            {list.length === 0 && <li className="text-xs text-gray-500">No accounts yet.</li>}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
