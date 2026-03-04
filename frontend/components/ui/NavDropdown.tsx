'use client';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import styles from './NavDropdown.module.css';

export function NavDropdown() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Position the portal menu below the trigger button
    const updatePos = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuPos({
            top: rect.bottom + 10 + window.scrollY,
            right: window.innerWidth - rect.right,
        });
    };

    const handleOpen = () => {
        updatePos();
        setOpen((o) => !o);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            const target = e.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(target) &&
                triggerRef.current && !triggerRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Reposition on scroll/resize
    useEffect(() => {
        if (!open) return;
        const onScroll = () => updatePos();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
        };
    }, [open]);

    if (!user) return null;

    const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
    const initials = user.first_name && user.last_name
        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
        : user.email[0].toUpperCase();

    const menu = open && (
        <div
            ref={menuRef}
            className={styles.menu}
            role="menu"
            aria-label="User menu"
            style={{ top: menuPos.top, right: menuPos.right, position: 'absolute' }}
        >
            {/* Welcome header */}
            <div className={styles.menuHeader}>
                <div className={styles.menuAvatar}>{initials}</div>
                <div>
                    <div className={styles.menuName}>
                        Welcome, {user.first_name || displayName}!
                    </div>
                    <div className={styles.menuEmail}>{user.email}</div>
                </div>
            </div>

            <div className={styles.menuDivider} />

            {/* Your Decision Stats */}
            <button
                id="nav-menu-stats"
                className={styles.menuItem}
                role="menuitem"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { setOpen(false); router.push('/dashboard'); }}
            >
                <span className={styles.menuIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="8" width="3" height="7" rx="1" fill="currentColor" opacity="0.5" />
                        <rect x="6" y="5" width="3" height="10" rx="1" fill="currentColor" opacity="0.75" />
                        <rect x="11" y="1" width="3" height="14" rx="1" fill="currentColor" />
                    </svg>
                </span>
                Your Decision Stats
                <span className={styles.menuBadge}>{user.decisions_used}</span>
            </button>

            {/* Invite a Friend */}
            <button
                id="nav-menu-invite"
                className={styles.menuItem}
                role="menuitem"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                    setOpen(false);
                    router.push('/invite');
                }}
            >
                <span className={styles.menuIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM5 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM5 11c-2.5 0-4 1.2-4 2.5V14h8v-.5C9 12.2 7.5 11 5 11zM11 10c-1.1 0-2 .4-2.7.9A5 5 0 0 1 10 13.5V14h5v-.5c0-1.3-1.5-2.5-4-3.5z" fill="currentColor" />
                    </svg>
                </span>
                Invite a Friend
            </button>

            <div className={styles.menuDivider} />

            {/* Dark / Light mode — stays open */}
            <button
                id="nav-menu-theme"
                className={styles.menuItem}
                role="menuitem"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => toggleTheme()}
            >
                <span className={styles.menuIcon}>
                    {theme === 'light' ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3V1M8 15v-2M3 8H1M15 8h-2M4.22 4.22 2.81 2.81M13.19 13.19l-1.41-1.41M4.22 11.78l-1.41 1.41M13.19 2.81l-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14 9.5A6 6 0 0 1 6.5 2a6 6 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    )}
                </span>
                {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                <span className={styles.themeToggle} data-theme={theme}>
                    <span className={styles.themeToggleKnob} />
                </span>
            </button>

            <div className={styles.menuDivider} />

            {/* Sign Out */}
            <button
                id="nav-menu-signout"
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                role="menuitem"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { setOpen(false); logout(); }}
            >
                <span className={styles.menuIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                Sign Out
            </button>
        </div>
    );

    return (
        <div className={styles.wrap}>
            {/* Trigger */}
            <button
                ref={triggerRef}
                id="nav-user-menu"
                className={styles.trigger}
                onClick={handleOpen}
                aria-expanded={open}
                aria-haspopup="true"
            >
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.userInfo}>
                    {/* <span className={styles.decisionsLeft}>Remaining Decisions - 
                        {user.decisions_remaining} 
                    </span> */}
                    <span className={styles.userName}>{displayName}</span>
                </div>
                <svg
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Portal: renders menu directly on document.body, escaping all overflow:hidden parents */}
            {typeof window !== 'undefined' && menu && createPortal(menu, document.body)}
        </div>
    );
}
