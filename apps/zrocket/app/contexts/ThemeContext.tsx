import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';

export type Theme = 'dark' | 'light' | 'system';

type ThemeProviderContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<
    ThemeProviderContextType | undefined
>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof localStorage === 'undefined') {
            return 'system';
        }

        return (localStorage.getItem('theme') || 'system') as Theme;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('theme', theme);
            }

            setTheme(theme);
        }
    };

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
