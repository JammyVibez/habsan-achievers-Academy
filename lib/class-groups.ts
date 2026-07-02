/** e.g. "JSS 1A" → "JSS 1", "JSS 2" → "JSS 2" */
export function getJssGroupKey(classLevel: string): string | null {
  const match = classLevel.trim().match(/^JSS\s+(\d+)/i);
  if (!match) return null;
  return `JSS ${match[1]}`;
}

/** True when value is a grouped JSS label like "JSS 1" (no stream letter). */
export function isJssGroupLabel(value: string): boolean {
  return /^JSS\s+\d+$/i.test(value.trim());
}

/** All catalog classes that belong to a JSS group, e.g. JSS 1 → [JSS 1A, JSS 1B, JSS 1C]. */
export function streamsInJssGroup(group: string, classes: string[]): string[] {
  const key = getJssGroupKey(group);
  if (!key) return [];
  return classes.filter((c) => getJssGroupKey(c) === key).sort((a, b) => a.localeCompare(b));
}

/** Map a concrete class or group label to the picker value (grouped for JSS). */
export function toClassPickerValue(classLevel: string): string {
  const group = getJssGroupKey(classLevel);
  if (!group) return classLevel.trim();
  return group;
}

export type ClassPickerOption = {
  value: string;
  label: string;
  streams: string[];
};

/** Collapse JSS streams into JSS 1 / 2 / 3 options; leave other classes as-is. */
export function toClassPickerOptions(classes: string[]): ClassPickerOption[] {
  const unique = [...new Set(classes.map((c) => c.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

  const jssGroups = new Map<string, string[]>();
  const standalone: string[] = [];

  for (const cls of unique) {
    const group = getJssGroupKey(cls);
    if (group) {
      const streams = jssGroups.get(group) ?? [];
      streams.push(cls);
      jssGroups.set(group, streams);
    } else {
      standalone.push(cls);
    }
  }

  const options: ClassPickerOption[] = [];

  for (const [group, streams] of [...jssGroups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    options.push({
      value: group,
      label: group,
      streams: streams.sort((a, b) => a.localeCompare(b)),
    });
  }

  for (const cls of standalone) {
    options.push({ value: cls, label: cls, streams: [cls] });
  }

  return options;
}

/** Prisma `classLevel` filter for a picker value (group or single class). */
export function classLevelsForPickerValue(
  pickerValue: string,
  knownClasses: string[],
): string[] {
  if (isJssGroupLabel(pickerValue)) {
    const streams = streamsInJssGroup(pickerValue, knownClasses);
    return streams.length > 0 ? streams : [pickerValue];
  }
  return [pickerValue.trim()];
}
