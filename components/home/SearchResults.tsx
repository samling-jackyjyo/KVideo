
import { ResultsHeader } from '@/components/search/ResultsHeader';
import { SourceBadges } from '@/components/search/SourceBadges';
import { TypeBadges } from '@/components/search/TypeBadges';
import { VideoGrid } from '@/components/search/VideoGrid';
import { useSourceBadges } from '@/lib/hooks/useSourceBadges';
import { useTypeBadges } from '@/lib/hooks/useTypeBadges';
import { Video, SourceBadge } from '@/lib/types';

interface SearchResultsProps {
    results: Video[];
    availableSources: SourceBadge[];
    loading: boolean;
    isSecret?: boolean;
}

export function SearchResults({ results, availableSources, loading, isSecret = false }: SearchResultsProps) {
    // Source badges hook - filters by video source
    const {
        selectedSources,
        filteredVideos: sourceFilteredVideos,
        toggleSource,
    } = useSourceBadges(results, availableSources);

    // Type badges hook - auto-collects and filters by type_name
    // Apply on source-filtered results for combined filtering
    const {
        typeBadges,
        selectedTypes,
        filteredVideos: finalFilteredVideos,
        toggleType,
    } = useTypeBadges(sourceFilteredVideos);

    if (results.length === 0 && !loading) return null;

    return (
        <div className="animate-fade-in">
            <ResultsHeader
                loading={loading}
                resultsCount={results.length}
                availableSources={availableSources}
            />

            {/* Source Badges - Clickable video source filtering */}
            {availableSources.length > 0 && (
                <SourceBadges
                    sources={availableSources}
                    selectedSources={selectedSources}
                    onToggleSource={toggleSource}
                    className="mb-6"
                />
            )}

            {/* Type Badges - Auto-collected from search results */}
            {typeBadges.length > 0 && (
                <TypeBadges
                    badges={typeBadges}
                    selectedTypes={selectedTypes}
                    onToggleType={toggleType}
                    className="mb-6"
                />
            )}

            {/* Display filtered videos (both source and type filters applied) */}
            <VideoGrid videos={finalFilteredVideos} isSecret={isSecret} />
        </div>
    );
}
