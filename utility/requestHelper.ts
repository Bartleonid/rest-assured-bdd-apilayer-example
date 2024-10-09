import request, { Response } from "supertest";

export function sendGet(
  baseUrl: string,
  endpoint: string,
  queryParams: object,
  headers: {},
  expectedStatus: any,
  done: (err?: any, response?: request.Response) => void,
  pollingConfig?: { timeout: number; interval: number },
  condition?: (response: request.Response) => boolean
): void {
  const defaultTimeout = 10000;
  const pollingInterval = pollingConfig?.interval || 2000;
  const maxTimeout = pollingConfig?.timeout || defaultTimeout;

  const startTime = Date.now();

  function poll() {
    request(baseUrl)
      .get(endpoint)
      .set("Content-Type", "application/json")
      .set(headers)
      .timeout({
        response: maxTimeout,
        deadline: maxTimeout + 1000,
      })
      .query(queryParams)
      .expect(expectedStatus)
      .end((err, response) => {
        if (err) {
          return done(err);
        }

        if (condition && condition(response)) {
          return done(null, response);
        }

        const elapsedTime = Date.now() - startTime;

        if (elapsedTime >= maxTimeout) {
          return done(new Error("Condition not met within the timeout."));
        }

        setTimeout(poll, pollingInterval);
      });
  }

  if (pollingConfig && condition) {
    poll();
  } else {
    request(baseUrl)
      .get(endpoint)
      .set("Content-Type", "application/json")
      .set(headers)
      .timeout({
        response: defaultTimeout,
        deadline: defaultTimeout + 1000,
      })
      .query(queryParams)
      .expect(expectedStatus)
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        done(null, response);
      });
  }
}

export function sendTooManyRequests(
  baseUrl: string,
  endpoint: string,
  queryParams: object,
  headers: {},
  rateLimit: number,
  expectedStatus: number,
  done: (err?: any, response?: request.Response) => void
): void {
  let requestCount = 0;
  let exceeded = false;

  function sendGetRequest(
    callback: (err?: any, response?: request.Response) => void
  ) {
    request(baseUrl)
      .get(endpoint)
      .set("Content-Type", "application/json")
      .set(headers)
      .query(queryParams)
      .expect(expectedStatus)
      .end((err, response) => {
        if (err) {
          return callback(err);
        }
        callback(null, response);
      });
  }

  function makeRequests() {
    if (requestCount < rateLimit && !exceeded) {
      sendGetRequest((err, response) => {
        if (err) {
          return done(err);
        }
        requestCount++;

        if (response.statusCode === 429) {
          console.log(`Rate limit exceeded after ${requestCount} requests`);
          exceeded = true;
          return done(null, response);
        } else if (requestCount === rateLimit && !exceeded) {
          return done(
            new Error(`Rate limit not exceeded after ${rateLimit} requests.`)
          );
        } else {
          makeRequests();
        }
      });
    }
  }

  makeRequests();
}
