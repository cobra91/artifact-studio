// This file will contain the logic for communicating with the sandboxed iframe.

export const SANDBOX_READY_MESSAGE = "sandbox-ready";
export const RENDER_COMPONENT_MESSAGE = "render-component";

export interface SandboxMessage {
  type: string;
  payload: any;
}

export const postSandboxMessage = (
  iframe: HTMLIFrameElement,
  message: SandboxMessage,
) => {
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage(message, "*");
  }
};
