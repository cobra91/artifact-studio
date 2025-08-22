import {
  addChildComponent,
  cloneComponentNode,
  createComponentNode,
  createDefaultMetadata,
  findComponentById,
  generateComponentId,
  getComponentDepth,
  removeChildComponent,
  updateComponentPosition,
  updateComponentProps,
  updateComponentSize,
  updateComponentStyles,
  validateComponentNode,
} from "../lib/componentOperations";
import { ComponentNode, ComponentType } from "../types/artifact";

describe("Component Operations", () => {
  describe("Component Creation", () => {
    it("should create a component node with default values", () => {
      const component = createComponentNode("button" as ComponentType);

      expect(component).toEqual({
        id: expect.any(String),
        type: "button",
        props: {},
        children: [],
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        rotation: 0,
        skew: { x: 0, y: 0 },
        styles: {},
        metadata: {
          version: "1.0.0",
          created: expect.any(Date),
          modified: expect.any(Date),
          author: "system",
          description: "",
          tags: [],
          locked: false,
          hidden: false,
        },
      });
    });

    it("should create a component node with custom values", () => {
      const customProps = { children: "Custom Button" };
      const customStyles = { backgroundColor: "#ff0000" };
      const position = { x: 10, y: 20 };
      const size = { width: 200, height: 100 };

      const component = createComponentNode(
        "button" as ComponentType,
        "custom-id",
        customProps,
        customStyles,
        position,
        size
      );

      expect(component.id).toBe("custom-id");
      expect(component.props).toEqual(customProps);
      expect(component.styles).toEqual(customStyles);
      expect(component.position).toEqual(position);
      expect(component.size).toEqual(size);
    });

    it("should generate unique component IDs", () => {
      const id1 = generateComponentId();
      const id2 = generateComponentId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^component_\d+_[a-z0-9]+$/);
    });

    it("should create default metadata", () => {
      const metadata = createDefaultMetadata();

      expect(metadata).toEqual({
        version: "1.0.0",
        created: expect.any(Date),
        modified: expect.any(Date),
        author: "system",
        description: "",
        tags: [],
        locked: false,
        hidden: false,
      });
    });
  });

  describe("Component Updates", () => {
    let testComponent: ComponentNode;

    beforeEach(() => {
      testComponent = createComponentNode(
        "button" as ComponentType,
        "test-button"
      );
    });

    it("should add child component", () => {
      const child = createComponentNode("text" as ComponentType, "child-text");
      const result = addChildComponent(testComponent, child);

      expect(result.children).toHaveLength(1);
      expect(result.children[0]).toEqual(child);
      expect(result.metadata?.modified).toBeInstanceOf(Date);
    });

    it("should remove child component", () => {
      const child1 = createComponentNode("text" as ComponentType, "child-1");
      const child2 = createComponentNode("text" as ComponentType, "child-2");

      let parent = addChildComponent(testComponent, child1);
      parent = addChildComponent(parent, child2);

      const result = removeChildComponent(parent, "child-1");

      expect(result.children).toHaveLength(1);
      expect(result.children[0].id).toBe("child-2");
    });

    it("should update component props", () => {
      const result = updateComponentProps(testComponent, {
        children: "Updated Text",
        disabled: true,
      });

      expect(result.props).toEqual({
        children: "Updated Text",
        disabled: true,
      });
      expect(result.metadata?.modified).toBeInstanceOf(Date);
    });

    it("should update component styles", () => {
      const result = updateComponentStyles(testComponent, {
        backgroundColor: "#ff0000",
        fontSize: "16px",
      });

      expect(result.styles).toEqual({
        backgroundColor: "#ff0000",
        fontSize: "16px",
      });
      expect(result.metadata?.modified).toBeInstanceOf(Date);
    });

    it("should update component position", () => {
      const newPosition = { x: 50, y: 100 };
      const result = updateComponentPosition(testComponent, newPosition);

      expect(result.position).toEqual(newPosition);
      expect(result.metadata?.modified).toBeInstanceOf(Date);
    });

    it("should update component size", () => {
      const newSize = { width: 300, height: 200 };
      const result = updateComponentSize(testComponent, newSize);

      expect(result.size).toEqual(newSize);
      expect(result.metadata?.modified).toBeInstanceOf(Date);
    });
  });

  describe("Component Validation", () => {
    it("should validate valid component", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "test-button"
      );
      const errors = validateComponentNode(component);

      expect(errors).toHaveLength(0);
    });

    it("should validate required fields", () => {
      const invalidComponent = {
        type: "button" as ComponentType,
        props: {},
        children: [],
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        styles: {},
      } as ComponentNode;

      const errors = validateComponentNode(invalidComponent);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: "id",
          message: "Component ID is required",
        })
      );
    });

    it("should validate position constraints", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "test-button"
      );
      component.position = { x: -10, y: -5 };

      const errors = validateComponentNode(component);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: "position.x",
          message: "Position X must be a non-negative number",
        })
      );
    });

    it("should validate size constraints", () => {
      const component = createComponentNode(
        "button" as ComponentType,
        "test-button"
      );
      component.size = { width: 0, height: -10 };

      const errors = validateComponentNode(component);

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "size.width",
            message: "Width must be a positive number",
          }),
          expect.objectContaining({
            field: "size.height",
            message: "Height must be a positive number",
          }),
        ])
      );
    });

    it("should validate children recursively", () => {
      const parent = createComponentNode(
        "container" as ComponentType,
        "parent"
      );
      const invalidChild = {
        type: "button" as ComponentType,
        props: {},
        children: [],
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        styles: {},
      } as ComponentNode;

      parent.children = [invalidChild];

      const errors = validateComponentNode(parent);

      expect(errors.some(error => error.field?.includes("children"))).toBe(
        true
      );
    });
  });

  describe("Component Utilities", () => {
    let rootComponent: ComponentNode;
    let child1: ComponentNode;
    let child2: ComponentNode;
    let grandchild: ComponentNode;

    beforeEach(() => {
      rootComponent = createComponentNode("container" as ComponentType, "root");
      child1 = createComponentNode("button" as ComponentType, "child-1");
      child2 = createComponentNode("text" as ComponentType, "child-2");
      grandchild = createComponentNode("image" as ComponentType, "grandchild");

      child2 = addChildComponent(child2, grandchild);
      rootComponent = addChildComponent(rootComponent, child1);
      rootComponent = addChildComponent(rootComponent, child2);
    });

    it("should find component by ID", () => {
      const found = findComponentById(rootComponent, "child-1");
      expect(found?.id).toBe("child-1");

      const notFound = findComponentById(rootComponent, "non-existent");
      expect(notFound).toBeNull();
    });

    it("should find nested component by ID", () => {
      const found = findComponentById(rootComponent, "grandchild");
      expect(found?.id).toBe("grandchild");
    });

    it("should calculate component depth", () => {
      expect(getComponentDepth(rootComponent)).toBe(3); // root -> child2 -> grandchild
      expect(getComponentDepth(child1)).toBe(0); // leaf node
      expect(getComponentDepth(grandchild)).toBe(0); // leaf node
    });

    it("should clone component node", () => {
      const cloned = cloneComponentNode(rootComponent);

      expect(cloned.id).toBe(rootComponent.id);
      expect(cloned.type).toBe(rootComponent.type);
      expect(cloned).not.toBe(rootComponent); // Different reference
      expect(cloned.children).not.toBe(rootComponent.children); // Different children array
      expect(cloned.children).toHaveLength(rootComponent.children.length);
    });

    it("should clone nested components", () => {
      const cloned = cloneComponentNode(rootComponent);

      // Check that nested children are also cloned
      const clonedChild2 = cloned.children.find(c => c.id === "child-2");
      const originalChild2 = rootComponent.children.find(
        c => c.id === "child-2"
      );

      expect(clonedChild2).not.toBe(originalChild2);
      expect(clonedChild2?.children).not.toBe(originalChild2?.children);
      expect(clonedChild2?.children[0].id).toBe("grandchild");
    });
  });
});
