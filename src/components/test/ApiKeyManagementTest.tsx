// API Key Management Test Component
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, Trash2, Plus, RefreshCw } from 'lucide-react';

// Types
type Provider = 'openai' | 'gemini' | 'mistral' | 'anthropic';

interface ApiKey {
  id: string;
  provider: Provider;
  key_preview: string;
  is_default: boolean;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

interface TestResult {
  success: boolean;
  message: string;
  provider: Provider;
}

export function ApiKeyManagementTest() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});

  // Add Key Dialog State
  const [newKey, setNewKey] = useState({
    provider: 'openai' as Provider,
    api_key: '',
    name: '',
  });

  // Encryption simulation (client-side demo only)
  const simulateEncryption = (key: string): string => {
    return btoa(key); // Base64 encoding for demo
  };

  const simulateDecryption = (encrypted: string): string => {
    return atob(encrypted); // Base64 decoding for demo
  };

  const getKeyPreview = (key: string): string => {
    if (key.length <= 4) return '****';
    return `****${key.slice(-4)}`;
  };

  // Load API Keys
  const loadKeys = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for testing
      const mockKeys: ApiKey[] = [
        {
          id: '1',
          provider: 'openai',
          key_preview: '****xyz1',
          is_default: true,
          is_active: true,
          usage_count: 150,
          last_used_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          provider: 'gemini',
          key_preview: '****abc2',
          is_default: false,
          is_active: true,
          usage_count: 45,
          last_used_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setKeys(mockKeys);
      toast({
        title: 'API Keys Loaded',
        description: `Found ${mockKeys.length} API keys`,
      });
    } catch (error) {
      toast({
        title: 'Error Loading Keys',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test API Key
  const testApiKey = async (keyId: string, provider: Provider) => {
    setTestingKey(keyId);
    try {
      // Simulate provider API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        toast({
          title: 'API Key Valid ✓',
          description: `${provider.toUpperCase()} API key is working correctly`,
        });
      } else {
        toast({
          title: 'API Key Invalid ✗',
          description: `${provider.toUpperCase()} API key failed validation`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTestingKey(null);
    }
  };

  // Add New API Key
  const addApiKey = async () => {
    if (!newKey.api_key || !newKey.provider) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both provider and API key',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate encryption
      const encrypted = simulateEncryption(newKey.api_key);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newKeyObj: ApiKey = {
        id: String(keys.length + 1),
        provider: newKey.provider,
        key_preview: getKeyPreview(newKey.api_key),
        is_default: keys.length === 0,
        is_active: true,
        usage_count: 0,
        last_used_at: null,
        created_at: new Date().toISOString(),
      };

      setKeys([...keys, newKeyObj]);
      setShowAddDialog(false);
      setNewKey({ provider: 'openai', api_key: '', name: '' });
      
      toast({
        title: 'API Key Added',
        description: `${newKey.provider.toUpperCase()} key has been encrypted and stored`,
      });
    } catch (error) {
      toast({
        title: 'Error Adding Key',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Key Active Status
  const toggleKeyStatus = async (keyId: string) => {
    try {
      setKeys(keys.map(k => 
        k.id === keyId ? { ...k, is_active: !k.is_active } : k
      ));
      toast({
        title: 'Status Updated',
        description: 'API key status has been updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // Set Default Key
  const setDefaultKey = async (keyId: string) => {
    try {
      setKeys(keys.map(k => ({
        ...k,
        is_default: k.id === keyId,
      })));
      toast({
        title: 'Default Key Updated',
        description: 'Default API key has been changed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // Delete Key
  const deleteKey = async (keyId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setKeys(keys.filter(k => k.id !== keyId));
      toast({
        title: 'API Key Deleted',
        description: 'API key has been removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const getProviderColor = (provider: Provider): string => {
    const colors = {
      openai: 'bg-green-500',
      gemini: 'bg-blue-500',
      mistral: 'bg-orange-500',
      anthropic: 'bg-purple-500',
    };
    return colors[provider];
  };

  const getProviderIcon = (provider: Provider): string => {
    const icons = {
      openai: '🤖',
      gemini: '✨',
      mistral: '🌬️',
      anthropic: '🧠',
    };
    return icons[provider];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management Test Suite
              </CardTitle>
              <CardDescription>
                Test the complete API key management system with encryption, validation, and usage tracking
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadKeys} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add API Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New API Key</DialogTitle>
                    <DialogDescription>
                      Add a new API key for AI providers. Keys are encrypted before storage.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Select 
                        value={newKey.provider} 
                        onValueChange={(value) => setNewKey({ ...newKey, provider: value as Provider })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI (GPT Models)</SelectItem>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="mistral">Mistral AI</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Key Name (Optional)</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Production Key"
                        value={newKey.name}
                        onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <div className="relative">
                        <Input
                          id="api_key"
                          type={showKey['new'] ? 'text' : 'password'}
                          placeholder="sk-..."
                          value={newKey.api_key}
                          onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowKey({ ...showKey, new: !showKey['new'] })}
                        >
                          {showKey['new'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        🔒 Key will be encrypted with AES-256 before storage
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addApiKey} disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Test Environment</AlertTitle>
            <AlertDescription>
              This is a test interface. All encryption is simulated client-side. In production, 
              encryption happens server-side with proper key management.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Keys ({keys.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({keys.filter(k => k.is_active).length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({keys.filter(k => !k.is_active).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {keys.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No API Keys</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first API key to get started
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            keys.map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getProviderColor(key.provider)} flex items-center justify-center text-white text-xl`}>
                        {getProviderIcon(key.provider)}
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{key.provider}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{key.key_preview}</code>
                          {key.is_default && (
                            <Badge variant="default">Default</Badge>
                          )}
                          {key.is_active ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={key.is_active}
                        onCheckedChange={() => toggleKeyStatus(key.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Usage Count</p>
                      <p className="font-medium">{key.usage_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Used</p>
                      <p className="font-medium">
                        {key.last_used_at 
                          ? new Date(key.last_used_at).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testApiKey(key.id, key.provider)}
                      disabled={testingKey === key.id}
                    >
                      {testingKey === key.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Test Key
                        </>
                      )}
                    </Button>
                    {!key.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultKey(key.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete ${key.provider} API key ${key.key_preview}?`)) {
                        deleteKey(key.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {keys.filter(k => k.is_active).map((key) => (
            <div key={key.id}>
              {/* Same card layout as "all" tab */}
              <p className="text-sm text-muted-foreground">Active key: {key.provider}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {keys.filter(k => !k.is_active).map((key) => (
            <div key={key.id}>
              {/* Same card layout as "all" tab */}
              <p className="text-sm text-muted-foreground">Inactive key: {key.provider}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Security Test Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Encryption Tests</CardTitle>
          <CardDescription>
            Validate encryption, input validation, and security controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Test AES-256 Encryption
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Test Input Validation
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Test Authorization (RLS)
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Test Key Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
