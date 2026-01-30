'use client';

import { useState } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Smartphone, Watch, Activity, Heart, Plus, RefreshCw, Trash2, Power, Zap } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useFirestore, useUser, useMemoFirebase, usePaginatedCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  addConnectedDevice,
  updateDeviceConnection,
  syncDevice,
  removeConnectedDevice,
  type DeviceType,
  type ConnectedDevice,
} from '@/lib/connected-devices-actions';

const DEVICE_TYPES: { id: DeviceType; name: string; icon: React.ElementType; desc: string }[] = [
  { id: 'fitbit', name: 'Fitbit', icon: Watch, desc: 'Steps, heart rate, sleep' },
  { id: 'apple_health', name: 'Apple Health', icon: Activity, desc: 'Steps, workouts, vitals' },
  { id: 'garmin', name: 'Garmin', icon: Watch, desc: 'Activity, heart rate' },
  { id: 'blood_pressure', name: 'Blood Pressure Monitor', icon: Heart, desc: 'BP readings' },
  { id: 'glucose_meter', name: 'Glucose Meter', icon: Activity, desc: 'Blood sugar levels' },
  { id: 'smart_watch', name: 'Smart Watch', icon: Watch, desc: 'General health tracking' },
  { id: 'other', name: 'Other Device', icon: Smartphone, desc: 'Custom device' },
];

const deviceSchema = z.object({
  deviceType: z.string().min(1, 'Please select a device type.'),
  deviceName: z.string().min(2, 'Device name must be at least 2 characters.'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
});

type DeviceFormValues = z.infer<typeof deviceSchema>;

export default function ConnectedDevicesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: { deviceType: '', deviceName: '', manufacturer: '', model: '' },
  });

  const devicesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'connectedDevices'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: devices, isLoading, refresh } = usePaginatedCollection<ConnectedDevice>(devicesQuery, { pageSize: 20 });

  const handleAddDevice = async (values: DeviceFormValues) => {
    if (!user) return;
    try {
      await addConnectedDevice(firestore, user.uid, {
        deviceType: values.deviceType as DeviceType,
        deviceName: values.deviceName,
        manufacturer: values.manufacturer,
        model: values.model,
      });
      toast({ title: 'Device added', description: `${values.deviceName} has been connected.` });
      setIsAddOpen(false);
      form.reset();
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to add device', description: e?.message || 'Please try again.' });
    }
  };

  const handleSync = async (deviceId: string) => {
    if (!user) return;
    setSyncing((m) => ({ ...m, [deviceId]: true }));
    try {
      await syncDevice(firestore, user.uid, deviceId);
      toast({ title: 'Synced', description: 'Device data has been synced.' });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync failed', description: e?.message || 'Please try again.' });
    } finally {
      setSyncing((m) => {
        const next = { ...m };
        delete next[deviceId];
        return next;
      });
    }
  };

  const handleToggleConnection = async (device: ConnectedDevice) => {
    if (!user) return;
    setToggling((m) => ({ ...m, [device.id]: true }));
    try {
      await updateDeviceConnection(firestore, user.uid, device.id, !device.isConnected);
      toast({
        title: device.isConnected ? 'Disconnected' : 'Connected',
        description: `${device.deviceName} is now ${device.isConnected ? 'disconnected' : 'connected'}.`,
      });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e?.message || 'Please try again.' });
    } finally {
      setToggling((m) => {
        const next = { ...m };
        delete next[device.id];
        return next;
      });
    }
  };

  const handleRemove = async (device: ConnectedDevice) => {
    if (!user) return;
    try {
      await removeConnectedDevice(firestore, user.uid, device.id);
      toast({ title: 'Removed', description: `${device.deviceName} has been removed.` });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to remove', description: e?.message || 'Please try again.' });
    }
  };

  const getDeviceMeta = (type: DeviceType) => DEVICE_TYPES.find((d) => d.id === type) || DEVICE_TYPES[DEVICE_TYPES.length - 1];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
            <Smartphone className="h-8 w-8 text-primary" />
            Connected Devices
          </h1>
          <p className="text-muted-foreground">
            Link wearables and health devices to sync your activity and vitals automatically.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Device</DialogTitle>
              <DialogDescription>
                Connect a new health device or wearable to track your data.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddDevice)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEVICE_TYPES.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My Fitbit Charge 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fitbit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Charge 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary text-white">
                    Add Device
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Devices List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 grid-mobile-fix w-full">
          <Skeleton className="h-40 w-full rounded-xl min-w-0" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : devices && devices.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 grid-mobile-fix w-full">
          {devices.map((device) => {
            const meta = getDeviceMeta(device.deviceType);
            const Icon = meta.icon;
            const lastSync = device.lastSyncAt?.toDate ? format(device.lastSyncAt.toDate(), 'MMM d, h:mm a') : 'Never';
            return (
              <Card key={device.id} className="border-2 transition-all hover:shadow-soft">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${device.isConnected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${device.isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                        <CardDescription>{meta.desc}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={device.isConnected ? 'default' : 'secondary'}>
                      {device.isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {device.manufacturer && <span>{device.manufacturer} </span>}
                    {device.model && <span>• {device.model}</span>}
                    {!device.manufacturer && !device.model && <span>No model info</span>}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Last synced: {lastSync}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!device.isConnected || syncing[device.id]}
                      onClick={() => handleSync(device.id)}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${syncing[device.id] ? 'animate-spin' : ''}`} />
                      {syncing[device.id] ? 'Syncing…' : 'Sync'}
                    </Button>
                    <Button
                      size="sm"
                      variant={device.isConnected ? 'outline' : 'default'}
                      disabled={toggling[device.id]}
                      onClick={() => handleToggleConnection(device)}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {device.isConnected ? 'Disconnect' : 'Connect'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove device?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {device.deviceName} from your connected devices. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemove(device)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices connected</h3>
            <p className="text-muted-foreground mb-4">
              Add your wearables and health devices to automatically sync your health data.
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="bg-gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Device
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Supported Devices */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Supported Device Types</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 grid-mobile-fix w-full">
          {DEVICE_TYPES.slice(0, -1).map((device) => {
            const Icon = device.icon;
            return (
              <Card key={device.id} className="border-2 hover:border-primary/50 transition-all cursor-pointer" onClick={() => {
                form.setValue('deviceType', device.id);
                setIsAddOpen(true);
              }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-muted-foreground">{device.desc}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help */}
      <Card className="border-2 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Have a device you&apos;d like to connect? Let us know via{' '}
            <a href="mailto:support@elderlink.in" className="text-primary hover:underline">
              support@elderlink.in
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
