import { HistoryItem } from './HistoryItem';
import { HistoryEmptyState } from './HistoryEmptyState';
import type { VideoHistoryItem } from '@/lib/types';

interface HistoryListProps {
    history: VideoHistoryItem[];
    onRemove: (videoId: string | number, source: string) => void;
    isSecret?: boolean;
}

export function HistoryList({ history, onRemove, isSecret = false }: HistoryListProps) {
    return (
        <div className="flex-1 overflow-y-auto -mx-2 px-2" style={{
            transform: 'translate3d(0, 0, 0)',
            WebkitOverflowScrolling: 'touch'
        }}>
            {history.length === 0 ? (
                <HistoryEmptyState />
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <HistoryItem
                            key={`${item.videoId}-${item.source}-${item.timestamp}`}
                            item={item}
                            onRemove={() => onRemove(item.videoId, item.source)}
                            isSecret={isSecret}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
