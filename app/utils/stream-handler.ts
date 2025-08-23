// app/utils/stream-handler.ts

export class StreamHandlerApi {
  static async handleStreamResponse(response: Response) {
    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let totalUsage: { prompt_tokens?: number; completion_tokens?: number } = {};

    return new ReadableStream({
      async start(controller) {
        let lastHeartbeat = Date.now();
        const heartbeatInterval = setInterval(() => {
          const now = Date.now();
          if (now - lastHeartbeat > 15000) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ content: " ", isComplete: false, timestamp: now })}\n\n`
              )
            );
            lastHeartbeat = now;
          }
        }, 15000);

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              if (buffer.trim()) {
                controller.enqueue(new TextEncoder().encode(buffer));
              }

              controller.close();
              clearInterval(heartbeatInterval);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            lastHeartbeat = Date.now();
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() === "") continue;

              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  controller.close();
                  clearInterval(heartbeatInterval);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);

                  // Track usage for API billing
                  if (parsed.usage) {
                    totalUsage = {
                      prompt_tokens:
                        parsed.usage.prompt_tokens || totalUsage.prompt_tokens,
                      completion_tokens:
                        parsed.usage.completion_tokens ||
                        totalUsage.completion_tokens,
                    };
                  }

                  // Enhanced metadata handling for message storage
                  if (parsed.choices?.length > 0) {
                    const choice = parsed.choices[0];

                    // If we have finish_reason and usage, inject metadata for client
                    if (choice.finish_reason && parsed.usage) {
                      const metadataChunk = {
                        metadata: {
                          finish_reason: choice.finish_reason,
                          native_finish_reason: choice.finish_reason,
                          totalTokens: parsed.usage.total_tokens || 0,
                          promptTokens: parsed.usage.prompt_tokens || 0,
                          completionTokens: parsed.usage.completion_tokens || 0,
                        },
                        done: choice.finish_reason === "stop",
                      };

                      // Send the metadata chunk first
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify(metadataChunk)}\n\n`
                        )
                      );
                    }
                  }

                  controller.enqueue(
                    new TextEncoder().encode(`data: ${data}\n\n`)
                  );
                } catch {
                  controller.enqueue(new TextEncoder().encode(`${line}\n`));
                }
              }
            }
          }
        } catch (error) {
          console.error("StreamHandlerApi", "error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
          clearInterval(heartbeatInterval);
        }
      },
    });
  }
}
