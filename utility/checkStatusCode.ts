import SuperTest from "supertest";

export const checkStatusCode = (
    response: any,
    expectedStatus: any
): SuperTest.Response => {
    if (response.status === expectedStatus) {
        return response;
    }
    const reqData = JSON.parse(JSON.stringify(response)).req;
    throw new Error(` 
request-method : ${JSON.stringify(reqData.method)} 
request-url : ${JSON.stringify(reqData.url)}
request-data : ${JSON.stringify(reqData.data)}
request-headers : ${JSON.stringify(reqData.headers)}
reponse-status : ${JSON.stringify(response.status)}
reponse-body : ${JSON.stringify(response.body)}
response-error : ${JSON.stringify(response.error)} 
`);
};
