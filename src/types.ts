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
