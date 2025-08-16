'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SecurityStats {
  totalBlockedIPs: number;
  totalFailedAttempts: number;
  totalSecurityEvents: number;
  recaptchaEnabled: boolean;
}

interface IPBlockInfo {
  ip: string;
  isBlocked: boolean;
  blockType: 'temporary' | 'permanent' | null;
  blockExpiry?: number;
  failedAttempts: number;
  blockCount: number;
  lastActivity?: string;
}

interface SecurityEvent {
  ip: string;
  event: string;
  timestamp: string;
  details: Record<string, any>;
}

export default function SecurityAdminPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [ipBlocks, setIpBlocks] = useState<IPBlockInfo[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockIP, setBlockIP] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState('3600');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [statsRes, blocksRes, eventsRes] = await Promise.all([
        fetch('/api/security/test'),
        fetch('/api/admin/security/blocks'),
        fetch('/api/admin/security/events'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (blocksRes.ok) {
        const blocksData = await blocksRes.json();
        setIpBlocks(blocksData.blocks || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setSecurityEvents(eventsData.events || []);
      }
    } catch (err) {
      setError('Failed to load security data');
      console.error('Security data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async () => {
    if (!blockIP.trim()) return;

    try {
      const response = await fetch(`/api/security/test?ip=${blockIP}&reason=${blockReason}&duration=${blockDuration}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlockIP('');
        setBlockReason('');
        setBlockDuration('3600');
        await loadSecurityData();
      } else {
        setError('Failed to block IP');
      }
    } catch (err) {
      setError('Failed to block IP');
      console.error('Block IP error:', err);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      const response = await fetch(`/api/admin/security/unblock?ip=${ip}`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadSecurityData();
      } else {
        setError('Failed to unblock IP');
      }
    } catch (err) {
      setError('Failed to unblock IP');
      console.error('Unblock IP error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Administration</h1>
        <Button onClick={loadSecurityData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlockedIPs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFailedAttempts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSecurityEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">reCAPTCHA</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stats.recaptchaEnabled ? "default" : "secondary"}>
                {stats.recaptchaEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="blocks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blocks">IP Blocks</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="manual">Manual Block</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>
                Manage IP addresses that have been blocked due to security violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ipBlocks.length === 0 ? (
                <p className="text-muted-foreground">No blocked IPs found</p>
              ) : (
                <div className="space-y-4">
                  {ipBlocks.map((block) => (
                    <div key={block.ip} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{block.ip}</div>
                        <div className="text-sm text-muted-foreground">
                          Failed attempts: {block.failedAttempts} | 
                          Block count: {block.blockCount}
                        </div>
                        {block.blockType && (
                          <Badge variant={block.blockType === 'permanent' ? 'destructive' : 'secondary'}>
                            {block.blockType}
                          </Badge>
                        )}
                        {block.blockExpiry && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {new Date(block.blockExpiry).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {block.isBlocked && block.blockType !== 'permanent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockIP(block.ip)}
                        >
                          Unblock
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Recent security events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityEvents.length === 0 ? (
                <p className="text-muted-foreground">No security events found</p>
              ) : (
                <div className="space-y-4">
                  {securityEvents.slice(0, 50).map((event, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-muted-foreground">
                          IP: {event.ip} | {new Date(event.timestamp).toLocaleString()}
                        </div>
                        {Object.keys(event.details).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {JSON.stringify(event.details, null, 2)}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">
                        {event.event}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manually Block IP</CardTitle>
              <CardDescription>
                Block an IP address manually for security reasons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  value={blockIP}
                  onChange={(e) => setBlockIP(e.target.value)}
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Suspicious activity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  placeholder="3600"
                />
              </div>
              <Button onClick={handleBlockIP} disabled={!blockIP.trim()}>
                Block IP
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
