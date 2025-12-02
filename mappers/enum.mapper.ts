export class EnumMapper {
  static mapStringToEnum<T extends Record<string, string | number>>(
    input: string | null | undefined,
    enumType: T,
    defaultValue: T[keyof T]
  ): T[keyof T] {
    if (!input) {
      console.warn(`EnumMapper: received null/undefined, defaulting to ${String(defaultValue)}`);
      return defaultValue;
    }

    const normalized = input.toString().trim().toUpperCase();

    const matchedKey = Object.keys(enumType).find((key) => {
      const value = enumType[key as keyof T];
      return key.toUpperCase() === normalized || String(value).toUpperCase() === normalized;
    });

    if (matchedKey) {
      return enumType[matchedKey as keyof T];
    }

    console.warn(`EnumMapper: invalid enum value "${input}", defaulting to ${String(defaultValue)}`);
    return defaultValue;
  }

  static mapEnumToString<T extends Record<string, string | number>>(value: T[keyof T]): string {
    return String(value);
  }
}
