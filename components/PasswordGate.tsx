'use client';

import { useState, useEffect } from 'react';
import { settingsStore } from '@/lib/store/settings-store';
import { Lock } from 'lucide-react';

const SESSION_UNLOCKED_KEY = 'kvideo-unlocked';

export function PasswordGate({ children, hasEnvPassword: initialHasEnvPassword }: { children: React.ReactNode, hasEnvPassword: boolean }) {
    const [isLocked, setIsLocked] = useState(true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [hasEnvPassword, setHasEnvPassword] = useState(initialHasEnvPassword);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        const settings = settingsStore.getSettings();
        const isUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';

        // Determine initial lock state immediately
        // Lock if (local password enabled OR env password exists) AND not already unlocked in session
        const shouldBeLocked = (settings.passwordAccess || initialHasEnvPassword) && !isUnlocked;

        setIsLocked(shouldBeLocked);
        setIsClient(true);

        // Still run background checks to keep everything in sync
        checkEnvPasswordStatus();
        checkLockStatus();
    }, [initialHasEnvPassword]);

    const checkEnvPasswordStatus = async () => {
        try {
            const res = await fetch('/api/config');
            const data = await res.json();
            setHasEnvPassword(data.hasEnvPassword);

            // Sync subscription sources if provided by environment
            if (data.subscriptionSources) {
                settingsStore.syncEnvSubscriptions(data.subscriptionSources);
            }
        } catch {
            // Silently fail
        }
    };

    const checkLockStatus = async () => {
        const settings = settingsStore.getSettings();
        const isUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';

        try {
            const res = await fetch('/api/config');
            const data = await res.json();
            // Note: envPasswordSet is not directly used for immediate locking if we want to rely on real-time settings
            // But we should respect the server config. 
            // However, for the subscription fix, we mainly care about 'settings.passwordAccess' updating in real-time.
            const envPasswordSet = data.hasEnvPassword;

            // Updated lock state check
            const currentlyLocked = (settings.passwordAccess || envPasswordSet) && !isUnlocked;
            setIsLocked(currentlyLocked);
        } catch {
            // Handle error by checking local settings
            const currentlyLocked = settings.passwordAccess && !isUnlocked;
            setIsLocked(currentlyLocked);
        }
    };

    // Subscribe to settings changes (real-time updates)
    useEffect(() => {
        // Function to handle updates from the store
        const handleSettingsUpdate = () => {
            const settings = settingsStore.getSettings();
            const isUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';

            // We can't easily check env password synchronously here, but we can check local settings.
            // If local setting says lock, and we are not unlocked, we lock.
            // If local setting says unlock (and no env password known yet), we unlock.
            // To be safe, we might just re-run checkLockStatus() but that's async.
            // For immediate UI feedback on "Enable/Disable Password" toggle in settings:

            // If password access is disabled in settings, and we assume no env password for a moment (or rely on previous state):
            if (!settings.passwordAccess && !hasEnvPassword) {
                setIsLocked(false);
            } else if (settings.passwordAccess && !isUnlocked) {
                setIsLocked(true);
            }
        };

        const unsubscribe = settingsStore.subscribe(handleSettingsUpdate);
        return () => unsubscribe();
    }, [hasEnvPassword]);



    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidating(true);

        const settings = settingsStore.getSettings();

        // First check local passwords
        if (settings.accessPasswords.includes(password)) {
            sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
            setIsLocked(false);
            setError(false);
            setIsValidating(false);
            return;
        }

        // Then check env password via API
        if (hasEnvPassword) {
            try {
                const res = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                });
                const data = await res.json();
                if (data.valid) {
                    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
                    setIsLocked(false);
                    setError(false);
                    setIsValidating(false);
                    return;
                }
            } catch {
                // API error, proceed to show error
            }
        }

        // Password didn't match
        setError(true);
        setIsValidating(false);
        const form = document.getElementById('password-form');
        form?.classList.add('animate-shake');
        setTimeout(() => form?.classList.remove('animate-shake'), 500);
    };

    if (!isClient) return null; // Prevent hydration mismatch

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-color)] bg-[image:var(--bg-image)] text-[var(--text-color)]">
            <div className="w-full max-w-md p-4">
                <form
                    id="password-form"
                    onSubmit={handleUnlock}
                    className="bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-md)] flex flex-col items-center gap-6 transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1)"
                >
                    <div className="w-16 h-16 rounded-[var(--radius-full)] bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] mb-2 shadow-[var(--shadow-sm)] border border-[var(--glass-border)]">
                        <Lock size={32} />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">访问受限</h2>
                        <p className="text-[var(--text-color-secondary)]">请输入访问密码以继续</p>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                placeholder="输入密码..."
                                className={`w-full px-4 py-3 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border ${error ? 'border-red-500' : 'border-[var(--glass-border)]'
                                    } focus:outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-color)_30%,transparent)] transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) text-[var(--text-color)] placeholder-[var(--text-color-secondary)]`}
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-red-500 text-center animate-pulse">
                                    密码错误
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[var(--accent-color)] text-white font-bold rounded-[var(--radius-2xl)] hover:translate-y-[-2px] hover:brightness-110 shadow-[var(--shadow-sm)] hover:shadow-[0_4px_8px_var(--shadow-color)] active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                        >
                            解锁访问
                        </button>
                    </div>
                </form>
            </div>
            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
        </div>
    );
}
