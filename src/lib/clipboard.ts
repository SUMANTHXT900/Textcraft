// Clipboard Utilities

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    }
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

export async function pasteFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      const text = await navigator.clipboard.readText();
      return text || null; // Handle empty clipboard
    }
    return null;
  } catch (err) {
    // Handle permission denied or other clipboard errors gracefully
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        console.warn("Clipboard access denied. Please allow clipboard permissions.");
      } else {
        console.error("Failed to paste text:", err.message);
      }
    } else {
      console.error("Failed to paste text:", err);
    }
    return null;
  }
}
