import { AICodeGenerator } from '../lib/aiCodeGen';

describe('AICodeGenerator', () => {
  let aiCodeGen: AICodeGenerator;

  beforeEach(() => {
    aiCodeGen = new AICodeGenerator();
  });

  it('should generate React code', () => {
    const components = [
      {
        id: '1',
        type: 'container',
        props: {},
        styles: {},
        children: [
          {
            id: '2',
            type: 'text',
            props: { children: 'Hello' },
            styles: {},
            children: [],
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
          },
        ],
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
      },
    ];
    const code = aiCodeGen.generateReactCode(components as any);
    expect(code).toContain('Hello');
    expect(code).toContain('div');
    expect(code).toContain('p');
  });
});
