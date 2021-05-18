import { createApp, close, createHttpRequest } from "@midwayjs/mock";
import { Framework } from "@midwayjs/web";
import { Application } from "egg";

describe("test/controller/api.test.ts", () => {
  let app: Application;

  beforeAll(async () => {
    // create app
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it("should POST /goods/add", async () => {
    // make request
    const result = await createHttpRequest(app)
      .post("/dxp/goods/add")
      .send({
        "title": "小鹏y",
        "pic": "1400",
        "price": "111",
        "type": "2",
        "category":{
          "id": 1,
          "name": "electron"
        }
      })

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(1001);
    expect(result.body.message).toBe("\"price\" must be less than or equal to 100");
  });
});
