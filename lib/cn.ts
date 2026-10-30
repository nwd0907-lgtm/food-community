/** falsy 값을 건너뛰고 클래스 이름을 공백으로 잇는다 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
