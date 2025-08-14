'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRequireAuth } from '@/hooks/use-auth';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config as wagmiConfig } from '@/lib/wagmi';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

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
                <Button className="w-full" variant="outline">
                  View Watchlists
                </Button>
                <Button className="w-full" variant="outline">
                  Price Alerts
                </Button>
                <Button className="w-full" variant="outline">
                  Trading Accounts
                </Button>
                <Button className="w-full" variant="outline">
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
              <div className="text-gray-500 text-center py-8">
                No recent activity to display
              </div>
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
