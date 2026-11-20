/** IME confirmation is not an instruction to commit a tag. 229 covers Safari's event ordering. */
export function isSubmitKey(event: Pick<KeyboardEvent, "key" | "isComposing" | "keyCode">): boolean {
  return event.key === "Enter" && !event.isComposing && event.keyCode !== 229;
}
