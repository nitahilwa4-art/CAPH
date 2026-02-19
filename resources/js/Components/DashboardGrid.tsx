import { useState, useCallback, useRef } from 'react';
import {
    ResponsiveGridLayout,
    type Layout,
    type ResponsiveLayouts,
} from 'react-grid-layout';
import { GripVertical, RotateCcw } from 'lucide-react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const STORAGE_KEY = 'caph-dashboard-layouts';

// Default layouts for different breakpoints
const DEFAULT_LAYOUTS: ResponsiveLayouts = {
    lg: [
        { i: 'trend-chart', x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 4 },
        { i: 'pie-chart', x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'budget-watch', x: 0, y: 6, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'upcoming-bills', x: 6, y: 6, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'recent-transactions', x: 0, y: 11, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'top-tags', x: 6, y: 11, w: 6, h: 5, minW: 3, minH: 3 },
    ],
    md: [
        { i: 'trend-chart', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
        { i: 'pie-chart', x: 6, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
        { i: 'budget-watch', x: 0, y: 5, w: 5, h: 5, minW: 3, minH: 3 },
        { i: 'upcoming-bills', x: 5, y: 5, w: 5, h: 5, minW: 3, minH: 3 },
        { i: 'recent-transactions', x: 0, y: 10, w: 5, h: 5, minW: 3, minH: 3 },
        { i: 'top-tags', x: 5, y: 10, w: 5, h: 5, minW: 3, minH: 3 },
    ],
    sm: [
        { i: 'trend-chart', x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'pie-chart', x: 0, y: 5, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'budget-watch', x: 0, y: 10, w: 6, h: 4, minW: 3, minH: 3 },
        { i: 'upcoming-bills', x: 0, y: 14, w: 6, h: 4, minW: 3, minH: 3 },
        { i: 'recent-transactions', x: 0, y: 18, w: 6, h: 4, minW: 3, minH: 3 },
        { i: 'top-tags', x: 0, y: 22, w: 6, h: 4, minW: 3, minH: 3 },
    ],
};

function loadLayouts(): ResponsiveLayouts | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return null;
}

function saveLayouts(layouts: ResponsiveLayouts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch { }
}

interface DashboardGridProps {
    children: React.ReactNode;
}

export function WidgetWrapper({
    children,
    title,
    className = '',
}: {
    children: React.ReactNode;
    title?: string;
    className?: string;
}) {
    return (
        <div className={`glass-card rounded-[2rem] flex flex-col h-full overflow-hidden transition-shadow duration-300 group/widget ${className}`}>
            {/* Drag handle */}
            <div className="drag-handle flex items-center gap-2 px-6 pt-4 pb-0 cursor-grab active:cursor-grabbing select-none shrink-0">
                <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover/widget:opacity-100 transition-opacity duration-200" />
                {title && (
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest opacity-0 group-hover/widget:opacity-100 transition-opacity duration-200">
                        Geser
                    </span>
                )}
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {children}
            </div>
        </div>
    );
}

export default function DashboardGrid({ children }: DashboardGridProps) {
    const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => loadLayouts() || DEFAULT_LAYOUTS);
    const [isEdited, setIsEdited] = useState(() => !!loadLayouts());
    const [width, setWidth] = useState(1200);

    // Measure container width using ResizeObserver
    const measuredRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const ro = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setWidth(entry.contentRect.width);
                }
            });
            ro.observe(node);
            setWidth(node.getBoundingClientRect().width);
        }
    }, []);

    const handleLayoutChange = useCallback((layout: Layout, allLayouts: ResponsiveLayouts) => {
        setLayouts(allLayouts);
        saveLayouts(allLayouts);
        setIsEdited(true);
    }, []);

    const handleReset = useCallback(() => {
        setLayouts({ ...DEFAULT_LAYOUTS });
        localStorage.removeItem(STORAGE_KEY);
        setIsEdited(false);
    }, []);

    return (
        <div className="relative" ref={measuredRef}>
            {/* Reset Button */}
            {isEdited && (
                <div className="flex justify-end mb-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-sm active:scale-95"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset Layout
                    </button>
                </div>
            )}

            <ResponsiveGridLayout
                className="dashboard-grid"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768 }}
                cols={{ lg: 12, md: 10, sm: 6 }}
                rowHeight={60}
                width={width}
                margin={[20, 20]}
                containerPadding={[0, 0]}
                onLayoutChange={handleLayoutChange}
                dragConfig={{ handle: '.drag-handle' }}
                resizeConfig={{ handles: ['se'] }}
                autoSize={true}
            >
                {children}
            </ResponsiveGridLayout>
        </div>
    );
}
