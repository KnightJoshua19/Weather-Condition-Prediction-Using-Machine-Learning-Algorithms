import {
  Info, HelpCircle, CreditCard, LogIn, UserPlus,
  User, FileEdit, Settings, LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { theme } from '../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  view?: string;
  isLogout?: boolean;
}

interface NavSection {
  name: string;
  items: NavItem[];
}

// ─── Static item pools ────────────────────────────────────────────────────────

const discoverItems: NavItem[] = [
  { label: 'About Us',    icon: <Info className="size-5" />,        href: '#about' },
  { label: 'How to Use?', icon: <HelpCircle className="size-5" />,  href: '#how-to-use' },
];

const workspaceItems: NavItem[] = [
  { label: 'Drafting', icon: <FileEdit className="size-5" />, href: '#drafting', view: 'drafting' },
];

const accountPublicItems: NavItem[] = [
  { label: 'Plans',   icon: <CreditCard className="size-5" />, href: '#plans' },
  { label: 'Sign In', icon: <UserPlus className="size-5" />,   href: '#sign-in' },
  { label: 'Login',   icon: <LogIn className="size-5" />,      href: '#login' },
];

const accountAuthItems: NavItem[] = [
  { label: 'Plans',    icon: <CreditCard className="size-5" />, href: '#plans' },
  { label: 'Settings', icon: <Settings className="size-5" />,   href: '#settings', view: 'settings' },
  { label: 'Logout',   icon: <LogOut className="size-5" />,     href: '#logout', isLogout: true },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────

/** Multiple people icon logo */
export function MultiplePeopleLogo({ size = 48, color = '#556E53' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Multiple People"
    >
      {/* Front person */}
      <circle cx="32" cy="20" r="8" fill={color} />
      <path
        d="M20 50 C20 38 26 34 32 34 C38 34 44 38 44 50 L20 50 Z"
        fill={color}
      />

      {/* Left person */}
      <circle cx="16" cy="18" r="6" fill={color} opacity="0.7" />
      <path
        d="M8 48 C8 38 12 35 16 35 C20 35 24 38 24 48 L8 48 Z"
        fill={color}
        opacity="0.7"
      />

      {/* Right person */}
      <circle cx="48" cy="18" r="6" fill={color} opacity="0.7" />
      <path
        d="M40 48 C40 38 44 35 48 35 C52 35 56 38 56 48 L40 48 Z"
        fill={color}
        opacity="0.7"
      />
    </svg>
  );
}

// ─── Single nav item ──────────────────────────────────────────────────────────

interface NavItemButtonProps {
  item: NavItem;
  isActive: boolean;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

function NavItemButton({ item, isActive, onNavigate, onLogout }: NavItemButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.isLogout) { onLogout?.(); return; }
    if (item.view && onNavigate) onNavigate(item.view);
  };

  return (
    <a
      href={item.href}
      onClick={handleClick}
      className="flex flex-col items-center gap-1 relative transition-all hover:opacity-75 group"
      title={item.label}
      style={{ color: theme.colors.dominant }}
    >
      {/* Active pill */}
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full"
          style={{ backgroundColor: theme.colors.dominant }}
        />
      )}

      {/* Icon */}
      <div
        className="p-1.5 rounded-lg transition-colors"
        style={{
          backgroundColor: isActive ? `${theme.colors.dominant}22` : 'transparent',
        }}
      >
        {item.icon}
      </div>

      {/* Label */}
      <span
        className="text-center leading-tight px-1"
        style={{
          fontSize: '10px',
          opacity: isActive ? 1 : 0.8,
          color: theme.colors.dominant,
        }}
      >
        {item.label}
      </span>
    </a>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: NavSection;
  activeView?: string;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

function SectionBlock({ section, activeView, onNavigate, onLogout }: SectionBlockProps) {
  return (
    <div className="w-full">
      {/* Section label */}
      <div className="flex items-center mb-3 px-2">
        <span
          className="uppercase tracking-[0.13em] truncate"
          style={{ fontSize: '11px', color: theme.colors.dominant, opacity: 0.7, fontWeight: 600 }}
        >
          {section.name}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-4">
        {section.items.map((item) => (
          <NavItemButton
            key={item.label}
            item={item}
            isActive={!!(item.view && activeView === item.view)}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        ))}
      </div>
    </div>
  );
}

// ─── NavigationRail ────────────────────────────────────────────────────────────

interface NavigationRailProps {
  isOpen: boolean;
  isAuthenticated?: boolean;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  activeView?: string;
}

export function NavigationRail({
  isOpen,
  isAuthenticated = false,
  onNavigate,
  onLogout,
  activeView,
}: NavigationRailProps) {
  const sections: NavSection[] = [
    { name: 'Discover',   items: discoverItems },
    { name: 'Workspace',  items: workspaceItems },
    { name: 'Account',    items: isAuthenticated ? accountAuthItems : accountPublicItems },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -120, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-28 flex flex-col items-center pt-6 pb-8 h-screen fixed md:relative z-50 overflow-y-auto"
          style={{ backgroundColor: theme.colors.theme }}
        >
          {/* Logo */}
          <div className="mb-6 flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.dominant }}
            >
              <MultiplePeopleLogo size={40} color={theme.colors.theme} />
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-6 flex-1 w-full px-2">
            {sections.map((section, idx) => (
              <div key={section.name} className="flex flex-col gap-6">
                <SectionBlock
                  section={section}
                  activeView={activeView}
                  onNavigate={onNavigate}
                  onLogout={onLogout}
                />

                {/* Horizontal separator between sections (not after last) */}
                {idx < sections.length - 1 && (
                  <div
                    className="w-full h-px mx-auto"
                    style={{ backgroundColor: `${theme.colors.dominant}22`, width: '80%' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* User avatar pill at bottom */}
          <div className="mt-8 flex-shrink-0">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{
                backgroundColor: isAuthenticated ? theme.colors.accent : `${theme.colors.dominant}20`,
                color: theme.colors.dominant,
              }}
              title={isAuthenticated ? 'Logged in' : 'Not logged in'}
            >
              <User className="size-5" />
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
