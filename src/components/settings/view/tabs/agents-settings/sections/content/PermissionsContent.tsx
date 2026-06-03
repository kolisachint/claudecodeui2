import {
  ClaudePermissions,
  type ClaudePermissionsProps,
  CursorPermissions,
  type CursorPermissionsProps,
  CodexPermissions,
  type CodexPermissionsProps,
  GeminiPermissions,
  type GeminiPermissionsProps,
} from './agentPermissions';

type PermissionsContentProps = ClaudePermissionsProps | CursorPermissionsProps | CodexPermissionsProps | GeminiPermissionsProps;

export default function PermissionsContent(props: PermissionsContentProps) {
  if (props.agent === 'claude') {
    return <ClaudePermissions {...props} />;
  }

  if (props.agent === 'cursor') {
    return <CursorPermissions {...props} />;
  }

  if (props.agent === 'gemini') {
    return <GeminiPermissions {...props} />;
  }

  return <CodexPermissions {...props} />;
}
