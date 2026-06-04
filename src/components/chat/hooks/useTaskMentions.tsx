import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from 'react';

import { authenticatedFetch } from '../../../utils/api';
import { loadSessionResource } from '../utils/sessionResourceCache';
import type { Project } from '../../../types/app';

export interface MentionableTask {
  id: string;
  title: string;
  status?: string;
}

interface UseTaskMentionsOptions {
  selectedProject: Project | null;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  cursorPosition: number;
}

type RawTask = { id?: string | number; title?: string; status?: string };

async function fetchProjectTasks(projectId: string): Promise<MentionableTask[]> {
  const response = await authenticatedFetch(`/api/taskmaster/tasks/${encodeURIComponent(projectId)}`);
  if (!response.ok) {
    return [];
  }
  const payload = (await response.json()) as { tasks?: RawTask[] };
  return (payload.tasks ?? [])
    .filter((task): task is RawTask & { id: string | number } => task.id !== undefined && task.id !== null)
    .map((task) => ({
      id: String(task.id),
      title: task.title ?? '',
      status: task.status,
    }));
}

// Rank task matches: exact id wins, then id prefix, then title prefix, then
// title substring; lower ids break ties. Returns -1 for non-matches.
const scoreTask = (task: MentionableTask, query: string): number => {
  const id = task.id.toLowerCase();
  const title = task.title.toLowerCase();
  if (!query) return 1;
  if (id === query) return 100;
  if (id.startsWith(query)) return 80;
  if (title.startsWith(query)) return 60;
  const titleIndex = title.indexOf(query);
  if (titleIndex !== -1) return 40 - Math.min(titleIndex, 19);
  return -1;
};

const rankTasks = (tasks: MentionableTask[], query: string): MentionableTask[] =>
  tasks
    .map((task) => ({ task, score: scoreTask(task, query) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.task.id.localeCompare(b.task.id, undefined, { numeric: true }))
    .map((entry) => entry.task);

/**
 * `#` task mentions: a popover above the composer that fuzzy-searches the
 * project's Task Master tasks and inserts a `#<id>` reference. Mirrors the `@`
 * file-mention flow and is session-cached so the task list is fetched live once
 * per project. The pane only appears when the project actually has tasks, so
 * non-TaskMaster projects are unaffected.
 */
export function useTaskMentions({ selectedProject, input, setInput, textareaRef, cursorPosition }: UseTaskMentionsOptions) {
  const [taskList, setTaskList] = useState<MentionableTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MentionableTask[]>([]);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(-1);
  const [hashPosition, setHashPosition] = useState(-1);

  useEffect(() => {
    const projectId = selectedProject?.projectId;
    if (!projectId) {
      setTaskList([]);
      return;
    }

    let cancelled = false;
    loadSessionResource(`tasks:${projectId}`, () => fetchProjectTasks(projectId))
      .then((tasks) => {
        if (!cancelled) {
          setTaskList(tasks);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTaskList([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProject?.projectId]);

  useEffect(() => {
    if (taskList.length === 0) {
      setShowTaskDropdown(false);
      setHashPosition(-1);
      return;
    }

    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');

    // Only trigger when `#` starts a token (line start or after whitespace), so
    // it doesn't fire inside words, URLs, or markdown headings mid-sentence.
    const precededByBoundary = lastHashIndex === 0 || /\s/.test(textBeforeCursor[lastHashIndex - 1] ?? '');
    if (lastHashIndex === -1 || !precededByBoundary) {
      setShowTaskDropdown(false);
      setHashPosition(-1);
      return;
    }

    const textAfterHash = textBeforeCursor.slice(lastHashIndex + 1);
    if (/\s/.test(textAfterHash)) {
      setShowTaskDropdown(false);
      setHashPosition(-1);
      return;
    }

    const matchingTasks = rankTasks(taskList, textAfterHash.toLowerCase()).slice(0, 10);
    setHashPosition(lastHashIndex);
    setShowTaskDropdown(matchingTasks.length > 0);
    setFilteredTasks(matchingTasks);
    setSelectedTaskIndex(matchingTasks.length > 0 ? 0 : -1);
  }, [input, cursorPosition, taskList]);

  const selectTask = useCallback(
    (task: MentionableTask) => {
      const textBeforeHash = input.slice(0, hashPosition);
      const textAfterHashQuery = input.slice(hashPosition);
      const spaceIndex = textAfterHashQuery.indexOf(' ');
      const textAfterQuery = spaceIndex !== -1 ? textAfterHashQuery.slice(spaceIndex) : '';

      const reference = `#${task.id}`;
      const newInput = `${textBeforeHash}${reference} ${textAfterQuery}`;
      const newCursorPosition = textBeforeHash.length + reference.length + 1;

      setInput(newInput);
      setShowTaskDropdown(false);
      setHashPosition(-1);

      if (!textareaRef.current) {
        return;
      }
      requestAnimationFrame(() => {
        if (!textareaRef.current) {
          return;
        }
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        if (!textareaRef.current.matches(':focus')) {
          textareaRef.current.focus();
        }
      });
    },
    [input, hashPosition, textareaRef, setInput],
  );

  const handleTaskMentionsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!showTaskDropdown || filteredTasks.length === 0) {
        return false;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedTaskIndex((previousIndex) => (previousIndex < filteredTasks.length - 1 ? previousIndex + 1 : 0));
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedTaskIndex((previousIndex) => (previousIndex > 0 ? previousIndex - 1 : filteredTasks.length - 1));
        return true;
      }

      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        selectTask(filteredTasks[selectedTaskIndex >= 0 ? selectedTaskIndex : 0]);
        return true;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setShowTaskDropdown(false);
        return true;
      }

      return false;
    },
    [showTaskDropdown, filteredTasks, selectedTaskIndex, selectTask],
  );

  return {
    showTaskDropdown,
    filteredTasks,
    selectedTaskIndex,
    selectTask,
    handleTaskMentionsKeyDown,
  };
}
