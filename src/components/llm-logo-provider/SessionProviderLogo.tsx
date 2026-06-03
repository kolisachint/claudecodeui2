import { getProviderLogo } from '../../providers/provider-registry';
import type { LLMProvider } from '../../types/app';

type SessionProviderLogoProps = {
  provider?: LLMProvider | string | null;
  className?: string;
};

export default function SessionProviderLogo({
  provider = 'claude',
  className = 'w-5 h-5',
}: SessionProviderLogoProps) {
  // Logo dispatch is driven by the provider registry so adding a CLI is a single
  // registry entry rather than another branch here. Unknown/retired ids fall
  // back to the Claude mark.
  const Logo = getProviderLogo(provider);
  return <Logo className={className} />;
}
