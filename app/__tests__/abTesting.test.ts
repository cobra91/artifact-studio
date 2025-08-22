import { ABTestingModule } from "../lib/abTesting";

describe("ABTestingModule", () => {
  let abTestingModule: ABTestingModule;

  beforeEach(() => {
    abTestingModule = new ABTestingModule();
  });

  it("should create a new test", () => {
    const test = abTestingModule.createTest("test", "1", "clicks");
    expect(test.name).toBe("test");
    expect(test.componentId).toBe("1");
    expect(test.trackingMetric).toBe("clicks");
  });
});
