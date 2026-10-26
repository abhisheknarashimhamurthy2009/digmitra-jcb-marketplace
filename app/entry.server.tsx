import {
  createDocumentRequestHandler,
  streamTimeout,
} from "@agent-native/core/server/entry-server";
import { ServerRouter } from "react-router";

const baseHandleDocumentRequest = createDocumentRequestHandler(ServerRouter);

export default async function handleDocumentRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: any,
  loadContext?: any
) {
  responseHeaders.set(
    "Permissions-Policy",
    "camera=*, microphone=*, geolocation=*, screen-wake-lock=*"
  );
  const response = await baseHandleDocumentRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
    loadContext
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=*, microphone=*, geolocation=*, screen-wake-lock=*"
  );
  return response;
}

export { streamTimeout };

