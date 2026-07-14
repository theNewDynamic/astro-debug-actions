export interface Breakpoint {
  name: string;
  /**
   * Minimum viewport width in px this breakpoint becomes active at. 0 for the base breakpoint.
   */
  minWidth: number;
  /**
   * CSS color applied to the handle background and box border while this breakpoint is active.
   */
  color: string;
}

export interface Badge {
  /**
   * Label shown before the value in the Project section, e.g. "Dataset".
   */
  label: string;
  /**
   * Text shown on the handle tab (closed) and next to the label in the Project section (open).
   */
  value: string;
  /**
   * CSS color applied to the tab/pill background. Defaults to black if omitted.
   */
  color?: string;
}
