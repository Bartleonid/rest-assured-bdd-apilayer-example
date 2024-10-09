import { expect } from 'chai';
import fetchEnvVar from '../../utility/fetchEnvVar';
const BASE_URL = fetchEnvVar("BASE_URL");
const API_KEY = fetchEnvVar("API_KEY");
import API from "../../data/urls.json";
import { sendGet, sendTooManyRequests } from "../../utility/requestHelper";
import { HttpStatusCode } from '../../enums/httpStatusCode';

describe('Exchange rate flow', function () {
  let headers: {};

  beforeEach(function () {
    headers = {
      apikey: API_KEY
    };
  });

  const queryParams = {
    base: "USD",
    symbols: "EUR,GBP"
  }
  it(`Get exchange rate data and verify status ${HttpStatusCode.OK}`, function (done) {
    sendGet(BASE_URL, `${API.fixer}`, queryParams, headers, HttpStatusCode.OK, (err, response) => {
      if (err) return done(err);
      expect(response.body.base).eq('USD');
      done();
    });
  });
  
  
  it(`Get exchange rate data and verify status ${HttpStatusCode.BAD_REQUEST}`, function (done) {
    sendGet(BASE_URL, `${API.fixer}%`, queryParams, headers, HttpStatusCode.BAD_REQUEST, (err, response) => {
      if (err) return done(err);
      done();
    });
  });

  it(`Get exchange rate data and verify status ${HttpStatusCode.UNAUTHORIZED}`, function (done) {
    headers = {
      apikey: API_KEY + 1
    };
    sendGet(BASE_URL, `${API.fixer}`, queryParams, headers, HttpStatusCode.UNAUTHORIZED, (err, response) => {
      if (err) return done(err);
      done();
    });
  });

  it(`Get exchange rate data and verify status ${HttpStatusCode.FORBIDDEN}`, function (done) {
    headers = { apikey: API_KEY};
    sendGet(BASE_URL, `/exchangerates_data/latest?`, queryParams, headers, HttpStatusCode.FORBIDDEN, (err, response) => {
      if (err) return done(err);
      done();
    });
  });

  it(`Get exchange rate data and verify status ${HttpStatusCode.NOT_FOUND}`, function (done) {
    sendGet(BASE_URL, `/api/latest`, queryParams, headers, HttpStatusCode.NOT_FOUND, (err, response) => {
      if (err) return done(err);
      done();
    });
  });

  it(`Get exchange rate data and verify status ${HttpStatusCode.TOO_MANY_REQUESTS}`, function (done) {
    sendTooManyRequests(BASE_URL, `${API.fixer}`, queryParams, headers, 100, HttpStatusCode.TOO_MANY_REQUESTS, (err, response) => {
      if (err) return done(err);
      done();
    });
  });
});
