import { Star, X } from 'lucide-react';

import { useGitHubStars } from '../../../../hooks/useGitHubStars';
import { IS_PLATFORM } from '../../../../constants/config';

const GITHUB_REPO_URL = 'https://github.com/kolisachint/hoocowork';

export default function GitHubStarBadge() {
  const { formattedCount, isDismissed, dismiss } = useGitHubStars('kolisachint', 'hoocowork');

  if (IS_PLATFORM || isDismissed) return null;

  return (
    <div className="group/star relative hidden md:block">
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="gh-star-badge badge inline-flex items-center gap-1.5 text-xs transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        <span className="font-mono text-[10px]" aria-hidden="true">GH</span>
        <Star className="h-3 w-3" />
        <span className="font-medium">Star</span>
        {formattedCount && (
          <span className="star-count border-l border-border/50 pl-1.5 tabular-nums">{formattedCount}</span>
        )}
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full border border-border/50 bg-muted text-muted-foreground transition-colors hover:text-foreground group-hover/star:flex"
        aria-label="Dismiss"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
