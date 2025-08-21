import { ComponentNode } from "../types/artifact";

export interface Variant {
  id: string;
  name: string;
  component: ComponentNode;
  traffic: number; // 0-100
}

export interface ABTest {
  id: string;
  name: string;
  componentId: string;
  variants: Variant[];
  trackingMetric: string;
}

const AB_TESTS_STORAGE_KEY = "ab-tests";

export class ABTestingModule {
  private tests: ABTest[] = [];

  constructor() {
    this.loadTests();
  }

  private loadTests() {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const storedTests = localStorage.getItem(AB_TESTS_STORAGE_KEY);
      if (storedTests) {
        this.tests = JSON.parse(storedTests);
      }
    } catch (error) {
      console.error("Failed to load A/B tests:", error);
    }
  }

  private saveTests() {
    try {
      localStorage.setItem(AB_TESTS_STORAGE_KEY, JSON.stringify(this.tests));
    } catch (error) {
      console.error("Failed to save A/B tests:", error);
    }
  }

  createTest(
    name: string,
    componentId: string,
    trackingMetric: string,
  ): ABTest {
    const test: ABTest = {
      id: crypto.randomUUID(),
      name,
      componentId,
      variants: [],
      trackingMetric,
    };
    this.tests.push(test);
    this.saveTests();
    return test;
  }

  getTestsForComponent(componentId: string): ABTest[] {
    return this.tests.filter((t) => t.componentId === componentId);
  }

  addVariant(
    testId: string,
    name: string,
    component: ComponentNode,
    traffic: number,
  ): Variant | null {
    const test = this.tests.find((t) => t.id === testId);
    if (!test) return null;

    const variant: Variant = {
      id: crypto.randomUUID(),
      name,
      component,
      traffic,
    };

    test.variants.push(variant);
    this.saveTests();
    return variant;
  }
}

export const abTestingModule = new ABTestingModule();
