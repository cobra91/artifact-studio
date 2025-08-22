export const SANDBOX_READY_MESSAGE = "sandbox-ready";
export const RENDER_COMPONENT_MESSAGE = "render-component";
export const ERROR_MESSAGE = "error";
export const TIMEOUT_MESSAGE = "timeout";

export interface SandboxMessage {
  type: string;
  payload: any;
}

const EXECUTION_TIMEOUT = 5000; // 5 seconds

export const postSandboxMessage = (
  iframe: HTMLIFrameElement,
  message: SandboxMessage
) => {
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage(message, "*");
  }
};

export const executeInSandbox = (
  iframe: HTMLIFrameElement,
  code: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Sandbox execution timed out."));
    }, EXECUTION_TIMEOUT);

    const messageHandler = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      const { type, payload } = event.data as SandboxMessage;

      clearTimeout(timeoutId);
      window.removeEventListener("message", messageHandler);

      if (type === RENDER_COMPONENT_MESSAGE) {
        resolve(payload);
      } else if (type === ERROR_MESSAGE) {
        reject(new Error(payload.error));
      } else {
        reject(new Error(`Unknown message type: ${type}`));
      }
    };

    window.addEventListener("message", messageHandler);

    postSandboxMessage(iframe, {
      type: RENDER_COMPONENT_MESSAGE,
      payload: { code },
    });
  });
};
