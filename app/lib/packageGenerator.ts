import { saveAs } from "file-saver";
import JSZip from "jszip";

import { ComponentNode, Framework } from "../types/artifact";

// Interface pour les options d'export
export interface ExportOptions {
  type: "component" | "package" | "project";
  framework: Framework | "nextjs";
  styling: "tailwind" | "css" | "scss" | "styled-components";
  includeTests: boolean;
  includeStorybook: boolean;
  packageName: string;
  description: string;
  author: string;
  version: string;
  license: string;
}

// Interface pour la structure du package
export interface PackageStructure {
  name: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// Classe de base pour les générateurs
abstract class BaseGenerator {
  protected abstract generateComponent(
    component: ComponentNode,
    options: ExportOptions,
  ): string;
  protected abstract generatePackageJson(options: ExportOptions): string;
  protected abstract generateConfigFiles(
    options: ExportOptions,
  ): Record<string, string>;
  protected abstract generateExampleFiles(
    options: ExportOptions,
  ): Record<string, string>;

  // Méthode commune pour générer le package
  async generatePackage(
    components: ComponentNode[],
    options: ExportOptions,
  ): Promise<Blob> {
    const zip = new JSZip();

    // Créer la structure de base
    const rootFolder = zip.folder(options.packageName) || zip;

    // Générer les composants
    components.forEach((component, _index) => {
      const componentName = this.formatComponentName(component.type);
      const componentCode = this.generateComponent(component, options);

      if (options.type === "component" || options.type === "package") {
        rootFolder.file(`src/components/${componentName}.tsx`, componentCode);

        // Générer les fichiers de test si demandé
        if (options.includeTests) {
          const testCode = this.generateComponentTest(component, options);
          rootFolder.file(
            `src/components/__tests__/${componentName}.test.tsx`,
            testCode,
          );
        }

        // Générer les stories pour Storybook si demandé
        if (options.includeStorybook) {
          const storyCode = this.generateComponentStory(component, options);
          rootFolder.file(
            `src/components/${componentName}.stories.tsx`,
            storyCode,
          );
        }
      }
    });

    // Générer le fichier d'index
    const indexContent = this.generateIndexFile(components);
    rootFolder.file("src/index.ts", indexContent);

    // Générer package.json
    const packageJson = this.generatePackageJson(options);
    rootFolder.file("package.json", packageJson);

    // Générer les fichiers de configuration
    const configFiles = this.generateConfigFiles(options);
    Object.entries(configFiles).forEach(([filename, content]) => {
      rootFolder.file(filename, content);
    });

    // Générer les fichiers d'exemple
    const exampleFiles = this.generateExampleFiles(options);
    Object.entries(exampleFiles).forEach(([filename, content]) => {
      const exampleFolder = rootFolder.folder("examples") || rootFolder;
      exampleFolder.file(filename, content);
    });

    // Générer le README
    const readme = this.generateReadme(options);
    rootFolder.file("README.md", readme);

    // Générer le fichier de licence
    const license = this.generateLicense(options);
    rootFolder.file("LICENSE", license);

    return await zip.generateAsync({ type: "blob" });
  }

  // Méthode pour télécharger le package
  async downloadPackage(
    components: ComponentNode[],
    options: ExportOptions,
  ): Promise<void> {
    const blob = await this.generatePackage(components, options);
    saveAs(blob, `${options.packageName}.zip`);
  }

  // Méthodes utilitaires
  protected formatComponentName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  protected generateIndexFile(components: ComponentNode[]): string {
    const imports = components
      .map((component) => {
        const componentName = this.formatComponentName(component.type);
        return `import ${componentName} from './components/${componentName}';`;
      })
      .join("\n");

    const exports = components
      .map((component) => {
        const componentName = this.formatComponentName(component.type);
        return `  ${componentName},`;
      })
      .join("\n");

    return `${imports}

export {
${exports}
};`;
  }

  protected generateComponentTest(
    component: ComponentNode,
    _options: ExportOptions,
  ): string {
    const componentName = this.formatComponentName(component.type);
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    // Add your assertions here
  });
});
`;
  }

  protected generateComponentStory(
    component: ComponentNode,
    _options: ExportOptions,
  ): string {
    const componentName = this.formatComponentName(component.type);
    return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {
    // Add your default args here
  },
};
`;
  }

  protected generateReadme(options: ExportOptions): string {
    return `# ${options.packageName}

${options.description}

## Installation

\`\`\`bash
npm install ${options.packageName}
\`\`\`

## Usage

\`\`\`jsx
import React from 'react';
import { /* components */ } from '${options.packageName}';

function App() {
  return (
    <div>
      {/* Use your components here */}
    </div>
  );
}

export default App;
\`\`\`

## Development

\`\`\`bash
npm install
npm run dev
npm run build
\`\`\`

## License

${options.license}
`;
  }

  protected generateLicense(options: ExportOptions): string {
    const year = new Date().getFullYear();
    return `MIT License

Copyright (c) ${year} ${options.author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
  }
}

// Générateur pour React
class ReactGenerator extends BaseGenerator {
  protected generateComponent(
    component: ComponentNode,
    options: ExportOptions,
  ): string {
    const componentName = this.formatComponentName(component.type);
    const className = component.props?.className || "";

    // Générer les styles selon l'approche choisie
    let styles = "";
    if (options.styling === "styled-components") {
      styles = `
import styled from 'styled-components';

const Styled${componentName} = styled.${component.type}\`
  /* Add your styles here */
\`;`;
    } else if (options.styling === "tailwind") {
      // Les styles Tailwind sont inclus directement dans le JSX
    }

    return `import React from 'react';
${styles}

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '${className}', 
  children 
}) => {
  ${
    options.styling === "styled-components"
      ? `return <Styled${componentName} className={className}>{children}</Styled${componentName}>;`
      : `return <${component.type} className={className}>{children}</${component.type}>;`
  }
};

export default ${componentName};
`;
  }

  protected generatePackageJson(options: ExportOptions): string {
    const packageJson = {
      name: options.packageName,
      version: options.version,
      description: options.description,
      main: "dist/index.js",
      module: "dist/index.esm.js",
      types: "dist/index.d.ts",
      files: ["dist"],
      scripts: {
        build: "rollup -c",
        dev: "rollup -c -w",
        test: "jest",
        lint: "eslint src --ext .ts,.tsx",
        storybook: "start-storybook -p 6006",
        "build-storybook": "build-storybook",
      },
      peerDependencies: {
        react: ">=16.8.0",
        "react-dom": ">=16.8.0",
      },
      devDependencies: {
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "@typescript-eslint/eslint-plugin": "^5.0.0",
        "@typescript-eslint/parser": "^5.0.0",
        eslint: "^8.0.0",
        "eslint-plugin-react": "^7.0.0",
        "eslint-plugin-react-hooks": "^4.0.0",
        jest: "^29.0.0",
        "@testing-library/react": "^13.0.0",
        "@testing-library/jest-dom": "^5.0.0",
        "@rollup/plugin-commonjs": "^24.0.0",
        "@rollup/plugin-node-resolve": "^15.0.0",
        "@rollup/plugin-typescript": "^11.0.0",
        rollup: "^3.0.0",
        "rollup-plugin-dts": "^5.0.0",
        "rollup-plugin-peer-deps-external": "^2.0.0",
        "rollup-plugin-terser": "^7.0.0",
        typescript: "^4.0.0",
      },
      keywords: ["react", "component", "ui"],
      author: options.author,
      license: options.license,
    };

    // Ajouter les dépendances selon le style
    if (options.styling === "styled-components") {
      (packageJson.devDependencies as Record<string, string>)[
        "@types/styled-components"
      ] = "^5.0.0";
    }

    return JSON.stringify(packageJson, null, 2);
  }

  protected generateConfigFiles(
    options: ExportOptions,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    // tsconfig.json
    files["tsconfig.json"] = JSON.stringify(
      {
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "es6"],
          allowJs: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: "esnext",
          moduleResolution: "node",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          declaration: true,
          outDir: "./dist",
        },
        include: ["src"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2,
    );

    // rollup.config.js
    files["rollup.config.js"] =
      `import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
];`;

    // .gitignore
    files[".gitignore"] = `node_modules/
dist/
.env
.DS_Store
*.log`;

    // eslint config
    files[".eslintrc.js"] = `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};`;

    // jest config
    files["jest.config.js"] = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};`;

    // setupTests.ts
    files["src/setupTests.ts"] = `import '@testing-library/jest-dom';`;

    // Ajouter les fichiers de configuration pour styled-components si nécessaire
    if (options.styling === "styled-components") {
      files["src/styled.d.ts"] = `import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    // Add your theme properties here
  }
}`;
    }

    return files;
  }

  protected generateExampleFiles(
    _options: ExportOptions,
  ): Record<string, string> {
    return {
      "basic.tsx": `import React from 'react';
import { /* components */ } from '../src';

function Example() {
  return (
    <div>
      <h1>Example Usage</h1>
      {/* Use your components here */}
    </div>
  );
}

export default Example;
`,
      "with-props.tsx": `import React from 'react';
import { /* components */ } from '../src';

function ExampleWithProps() {
  return (
    <div>
      <h1>Example with Props</h1>
      {/* Use your components with props here */}
    </div>
  );
}

export default ExampleWithProps;
`,
    };
  }
}

// Générateur pour Vue
class VueGenerator extends BaseGenerator {
  protected generateComponent(
    component: ComponentNode,
    _options: ExportOptions,
  ): string {
    const _componentName = this.formatComponentName(component.type);

    return `<template>
  <${component.type} class="${component.props?.className || ""}">
    <slot></slot>
  </${component.type}>
</template>

<script setup lang="ts">
// Add your component logic here
</script>

<style scoped>
/* Add your styles here */
</style>
`;
  }

  protected generatePackageJson(options: ExportOptions): string {
    const packageJson = {
      name: options.packageName,
      version: options.version,
      description: options.description,
      main: "dist/index.js",
      module: "dist/index.esm.js",
      types: "dist/index.d.ts",
      files: ["dist"],
      scripts: {
        build: "vite build",
        dev: "vite",
        preview: "vite preview",
        test: "vitest",
        storybook: "storybook dev -p 6006",
        "build-storybook": "storybook build",
      },
      peerDependencies: {
        vue: "^3.0.0",
      },
      devDependencies: {
        "@vitejs/plugin-vue": "^4.0.0",
        vue: "^3.0.0",
        "@typescript-eslint/eslint-plugin": "^5.0.0",
        "@typescript-eslint/parser": "^5.0.0",
        eslint: "^8.0.0",
        "eslint-plugin-vue": "^9.0.0",
        typescript: "^4.0.0",
        vite: "^4.0.0",
        vitest: "^0.28.0",
        "@vue/test-utils": "^2.0.0",
        jsdom: "^21.0.0",
      },
      keywords: ["vue", "component", "ui"],
      author: options.author,
      license: options.license,
    };

    return JSON.stringify(packageJson, null, 2);
  }

  protected generateConfigFiles(
    options: ExportOptions,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    // tsconfig.json
    files["tsconfig.json"] = JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          module: "ESNext",
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "preserve",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2,
    );

    // vite.config.ts
    files["vite.config.ts"] = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '${options.packageName}',
      fileName: (format) => \`index.\${format}.js\`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});`;

    // .gitignore
    files[".gitignore"] = `node_modules/
dist/
.env
.DS_Store
*.log`;

    return files;
  }

  protected generateExampleFiles(
    _options: ExportOptions,
  ): Record<string, string> {
    return {
      "basic.vue": `<template>
  <div>
    <h1>Example Usage</h1>
    <!-- Use your components here -->
  </div>
</template>

<script setup lang="ts">
// Import and use your components here
</script>
`,
      "with-props.vue": `<template>
  <div>
    <h1>Example with Props</h1>
    <!-- Use your components with props here -->
  </div>
</template>

<script setup lang="ts">
// Import and use your components with props here
</script>
`,
    };
  }
}

// Générateur pour Svelte
class SvelteGenerator extends BaseGenerator {
  protected generateComponent(
    component: ComponentNode,
    _options: ExportOptions,
  ): string {
    return `<script lang="ts">
  // Add your component logic here
</script>

<${component.type} class="${component.props?.className || ""}">
  <slot />
</${component.type}>

<style>
  /* Add your styles here */
</style>
`;
  }

  protected generatePackageJson(options: ExportOptions): string {
    const packageJson = {
      name: options.packageName,
      version: options.version,
      description: options.description,
      main: "dist/index.js",
      module: "dist/index.mjs",
      svelte: "src/index.js",
      types: "dist/index.d.ts",
      files: ["dist", "src"],
      scripts: {
        build: "rollup -c",
        dev: "rollup -c -w",
        test: "vitest",
        storybook: "storybook dev -p 6006",
        "build-storybook": "storybook build",
      },
      peerDependencies: {
        svelte: "^3.0.0 || ^4.0.0",
      },
      devDependencies: {
        "@rollup/plugin-commonjs": "^24.0.0",
        "@rollup/plugin-node-resolve": "^15.0.0",
        "@rollup/plugin-typescript": "^11.0.0",
        "@tsconfig/svelte": "^3.0.0",
        rollup: "^3.0.0",
        "rollup-plugin-svelte": "^7.0.0",
        "rollup-plugin-terser": "^7.0.0",
        svelte: "^3.0.0 || ^4.0.0",
        "svelte-check": "^3.0.0",
        "svelte-preprocess": "^5.0.0",
        tslib: "^2.0.0",
        typescript: "^4.0.0",
      },
      keywords: ["svelte", "component", "ui"],
      author: options.author,
      license: options.license,
    };

    return JSON.stringify(packageJson, null, 2);
  }

  protected generateConfigFiles(
    options: ExportOptions,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    // tsconfig.json
    files["tsconfig.json"] = JSON.stringify(
      {
        extends: "@tsconfig/svelte/tsconfig.json",
        compilerOptions: {
          target: "es2017",
          module: "es2015",
          moduleResolution: "node",
          declaration: true,
          outDir: "./dist",
          rootDirs: ["src", "stories"],
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          strict: true,
          skipLibCheck: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2,
    );

    // rollup.config.js
    files["rollup.config.js"] = `import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';

const packageJson = require('./package.json');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'umd',
      name: '${options.packageName}',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        dev: false,
      },
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      sourceMap: true,
      inlineSources: true,
    }),
    terser(),
  ],
  external: ['svelte'],
};`;

    // svelte.config.js
    files["svelte.config.js"] =
      `import sveltePreprocess from 'svelte-preprocess';

export default {
  preprocess: sveltePreprocess(),
};`;

    // .gitignore
    files[".gitignore"] = `node_modules/
dist/
.env
.DS_Store
*.log
.svelte-kit`;

    return files;
  }

  protected generateExampleFiles(
    _options: ExportOptions,
  ): Record<string, string> {
    return {
      "basic.svelte": `<script>
  // Import and use your components here
</script>

<div>
  <h1>Example Usage</h1>
  <!-- Use your components here -->
</div>
`,
      "with-props.svelte": `<script>
  // Import and use your components with props here
</script>

<div>
  <h1>Example with Props</h1>
  <!-- Use your components with props here -->
</div>
`,
    };
  }
}

// Générateur pour Next.js
class NextjsGenerator extends BaseGenerator {
  protected generateComponent(
    component: ComponentNode,
    _options: ExportOptions,
  ): string {
    const componentName = this.formatComponentName(component.type);
    const className = component.props?.className || "";

    return `import React from 'react';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '${className}', 
  children 
}) => {
  return <${component.type} className={className}>{children}</${component.type}>;
};

export default ${componentName};
`;
  }

  protected generatePackageJson(options: ExportOptions): string {
    const packageJson = {
      name: options.packageName,
      version: options.version,
      description: options.description,
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "13.4.0",
        react: "18.2.0",
        "react-dom": "18.2.0",
      },
      devDependencies: {
        "@types/node": "^18.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        eslint: "^8.0.0",
        "eslint-config-next": "^13.0.0",
        typescript: "^5.0.0",
      },
      keywords: ["nextjs", "react", "component", "ui"],
      author: options.author,
      license: options.license,
    };

    return JSON.stringify(packageJson, null, 2);
  }

  protected generateConfigFiles(
    options: ExportOptions,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    // tsconfig.json
    files["tsconfig.json"] = JSON.stringify(
      {
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "es6"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "node",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          paths: {
            "@/*": ["./*"],
          },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        exclude: ["node_modules"],
      },
      null,
      2,
    );

    // next.config.js
    files["next.config.js"] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
`;

    // .gitignore
    files[".gitignore"] = `.next/
node_modules/
.env*
!.env.example
out/
build/
.nyc_output/
coverage/
.nyc_output/
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env.local
.env.development.local
.env.test.local
.env.production.local
`;

    // .eslintrc.json
    files[".eslintrc.json"] = JSON.stringify(
      {
        extends: "next/core-web-vitals",
      },
      null,
      2,
    );

    // Créer la structure de pages
    files["pages/_app.tsx"] = `import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
`;

    files["pages/index.tsx"] = `import React from 'react';
import { /* components */ } from '../components';

export default function Home() {
  return (
    <div>
      <h1>Welcome to ${options.packageName}</h1>
      {/* Use your components here */}
    </div>
  );
}
`;

    // Créer la structure de composants
    files["components/index.ts"] = `// Export your components here
`;

    // Créer les styles globaux
    files["styles/globals.css"] = `/* Global styles */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
`;

    return files;
  }

  protected generateExampleFiles(
    _options: ExportOptions,
  ): Record<string, string> {
    return {
      "about.tsx": `import React from 'react';

export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is an example page using your components.</p>
    </div>
  );
}
`,
      "contact.tsx": `import React from 'react';

export default function Contact() {
  return (
    <div>
      <h1>Contact Page</h1>
      <p>This is another example page using your components.</p>
    </div>
  );
}
`,
    };
  }

  protected generateIndexFile(components: ComponentNode[]): string {
    const imports = components
      .map((component) => {
        const componentName = this.formatComponentName(component.type);
        return `import ${componentName} from './components/${componentName}';`;
      })
      .join("\n");

    const exports = components
      .map((component) => {
        const componentName = this.formatComponentName(component.type);
        return `  ${componentName},`;
      })
      .join("\n");

    return `${imports}

export {
${exports}
};`;
  }
}

// Factory pour créer les générateurs appropriés
export class PackageGeneratorFactory {
  static createGenerator(framework: Framework | "nextjs"): BaseGenerator {
    switch (framework) {
      case "react":
        return new ReactGenerator();
      case "vue":
        return new VueGenerator();
      case "svelte":
        return new SvelteGenerator();
      case "nextjs":
        return new NextjsGenerator();
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }
}

// Fonction utilitaire pour générer et télécharger un package
export async function generateAndDownloadPackage(
  components: ComponentNode[],
  options: ExportOptions,
): Promise<void> {
  const generator = PackageGeneratorFactory.createGenerator(options.framework);
  await generator.downloadPackage(components, options);
}

const packageGenerator = {
  PackageGeneratorFactory,
  generateAndDownloadPackage,
};

export default packageGenerator;
