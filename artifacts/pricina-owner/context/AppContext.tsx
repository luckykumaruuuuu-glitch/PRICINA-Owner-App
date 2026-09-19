import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseProjectId, firestore } from '@/lib/firebase';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'follow-up'
  | 'converted'
  | 'closed';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  selectedPlan: string;
  services: string[];
  message: string;
  createdAt: Timestamp | Date | string | number | null;
  status: LeadStatus;
  clientType: string;
  isExisting: boolean;
}

export interface AppNotification {
  id: string;
  leadId: string;
  title: string;
  detail: string;
  createdAt: number;
  read: boolean;
}

interface AppContextValue {
  user: User | null;
  leads: Lead[];
  notifications: AppNotification[];
  isLoading: boolean;
  isLeadsLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearError: () => void;
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const notificationsKey = '@pricina/notifications';

const fallback = 'Not provided';
const stringValue = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

const statusValue = (value: unknown): LeadStatus => {
  const normalized = String(value ?? 'new').toLowerCase();
  if (
    normalized === 'contacted' ||
    normalized === 'follow-up' ||
    normalized === 'converted' ||
    normalized === 'closed'
  ) {
    return normalized;
  }
  return 'new';
};

const timestampValue = (value: unknown): Lead['createdAt'] => {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value as Timestamp;
  }
  if (value instanceof Date || typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return null;
};

const mapLead = (id: string, value: Record<string, unknown>): Lead => ({
  id,
  name: stringValue(value.name),
  phone: stringValue(value.phone),
  email: stringValue(value.email),
  businessName: stringValue(value.businessName),
  businessType: stringValue(value.businessType),
  selectedPlan: stringValue(value.selectedPlan),
  services: Array.isArray(value.services)
    ? value.services.map((service) => String(service))
    : value.services
      ? [String(value.services)]
      : [],
  message: stringValue(value.message),
  createdAt: timestampValue(
    value.createdAt ?? value.submittedAt ?? value.submitted_at ?? value.timestamp,
  ),
  status: statusValue(value.status),
  clientType: stringValue(value.clientType),
  isExisting: false,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const knownLeadIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(notificationsKey).then((stored) => {
      if (!mounted || !stored) return;
      try {
        setNotifications(JSON.parse(stored) as AppNotification[]);
      } catch {
        setNotifications([]);
      }
    });

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (!mounted) return;
      if (!nextUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const ownerDoc = await getDoc(doc(firestore, 'users', nextUser.uid));
        if (!ownerDoc.exists() || ownerDoc.data().role !== 'owner') {
          await signOut(firebaseAuth);
          setError('This account is not authorized for the PRICINA Owner Portal.');
          setUser(null);
        } else {
          setUser(nextUser);
        }
      } catch {
        setError('Unable to verify your owner access. Please try again.');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setLeads([]);
      setIsLeadsLoading(false);
      knownLeadIds.current = null;
      setError('Owner session is not available for Firestore lead access.');
      return;
    }
    setIsLeadsLoading(true);
    setError(null);
    const leadsQuery = query(collection(firestore, 'leads'), limit(200));
    if (__DEV__) {
      console.info('[PRICINA] Firestore listener starting', {
        projectId: firebaseProjectId,
        collection: 'leads',
        uid: firebaseAuth.currentUser?.uid ?? user.uid,
      });
    }
    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const mapped = snapshot.docs
          .map((leadDoc) => mapLead(leadDoc.id, leadDoc.data()))
          .sort((left, right) => {
            const toMillis = (value: Lead['createdAt']) => {
              if (!value) return 0;
              if (value instanceof Date) return value.getTime();
              if (typeof value === 'object' && 'toDate' in value) return value.toDate().getTime();
              const parsed = new Date(value).getTime();
              return Number.isNaN(parsed) ? 0 : parsed;
            };
            return toMillis(right.createdAt) - toMillis(left.createdAt);
          });
        if (__DEV__) {
          console.info('[PRICINA] Firestore listener received documents', {
            projectId: firebaseProjectId,
            collection: 'leads',
            uid: firebaseAuth.currentUser?.uid ?? user.uid,
            count: mapped.length,
          });
        }
        const phoneCounts = new Map<string, number>();
        mapped.forEach((lead) => {
          const phone = normalizePhone(lead.phone);
          if (phone) phoneCounts.set(phone, (phoneCounts.get(phone) ?? 0) + 1);
        });
        const nextLeads = mapped.map((lead) => ({
          ...lead,
          isExisting:
            lead.clientType.toLowerCase() === 'existing' ||
            (!!normalizePhone(lead.phone) &&
              (phoneCounts.get(normalizePhone(lead.phone)) ?? 0) > 1),
        }));
        const previousIds = knownLeadIds.current;
        if (previousIds) {
          const fresh = nextLeads.filter((lead) => !previousIds.has(lead.id));
          if (fresh.length) {
            setNotifications((current) => {
              const next = [
                ...fresh.map((lead) => ({
                  id: `${lead.id}-${Date.now()}`,
                  leadId: lead.id,
                  title: 'New PRICINA inquiry',
                  detail: `${lead.name} • New inquiry received`,
                  createdAt: Date.now(),
                  read: false,
                })),
                ...current,
              ].slice(0, 50);
              void AsyncStorage.setItem(notificationsKey, JSON.stringify(next));
              return next;
            });
          }
        }
        knownLeadIds.current = new Set(nextLeads.map((lead) => lead.id));
        setLeads(nextLeads);
        setIsLeadsLoading(false);
      },
      (snapshotError) => {
        setIsLeadsLoading(false);
        const errorCode = snapshotError.code ?? 'unknown';
        const errorMessage = snapshotError.message ?? 'Unknown Firestore error.';
        if (__DEV__) {
          console.error('[PRICINA] Firestore listener failed', {
            projectId: firebaseProjectId,
            collection: 'leads',
            uid: firebaseAuth.currentUser?.uid ?? user.uid,
            code: errorCode,
            message: errorMessage,
          });
        }
        setError(`Unable to load inquiries (${errorCode}): ${errorMessage}`);
      },
    );
    return unsubscribe;
  }, [user, refreshVersion]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    } catch {
      throw new Error('Invalid email or password.');
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    setNotifications([]);
    await AsyncStorage.removeItem(notificationsKey);
  }, []);

  const updateLeadStatus = useCallback(async (id: string, status: LeadStatus) => {
    const previous = leads;
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
    );
    try {
      await updateDoc(doc(firestore, 'leads', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch {
      setLeads(previous);
      throw new Error('Status could not be updated. Please try again.');
    }
  }, [leads]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) => {
      const next = current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      );
      void AsyncStorage.setItem(notificationsKey, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      leads,
      notifications,
      isLoading,
      isLeadsLoading,
      error,
      isConfigured: Boolean(firebaseProjectId),
      signIn,
      logout,
      updateLeadStatus,
      markNotificationRead,
      clearError: () => setError(null),
      refresh: () => setRefreshVersion((value) => value + 1),
    }),
    [
      user,
      leads,
      notifications,
      isLoading,
      isLeadsLoading,
      error,
      signIn,
      logout,
      updateLeadStatus,
      markNotificationRead,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

export function useLead(id: string | string[] | undefined) {
  const { leads } = useApp();
  const leadId = Array.isArray(id) ? id[0] : id;
  return leads.find((lead) => lead.id === leadId);
}