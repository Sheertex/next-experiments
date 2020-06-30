import traverse from '@babel/traverse';
import fs from 'fs-extra';
import { parse } from '@babel/parser';
import nodePath from 'path';
import { EXPERIMENT_COMPONENT_NAME, VARIANT_COMPONENT_NAME } from './constants';

function getVisitor(cache): object {
  return {
    JSXOpeningElement(path) {
      const openingElement = path.container.openingElement;

      const elementName =
        (openingElement.name && openingElement.name.name) ||
        (openingElement.name.property && openingElement.name.property.name);

      if (elementName !== EXPERIMENT_COMPONENT_NAME) {
        return;
      }

      const experimentNameAttribute = openingElement.attributes.find(
        (attr) => attr.name.name === 'name',
      );

      if (!experimentNameAttribute) {
        // due to bug in babel "path.buildCodeFrameError" is not working
        throw new Error('Found experiment without name');
      }

      const experimentNameValue = experimentNameAttribute.value.value;

      if (!experimentNameValue) {
        throw new Error('Found experiment with empty name');
      }

      const variantNames = path.container.children
        .filter(
          (child) =>
            child.type === 'JSXElement' &&
            child.openingElement.name.name === VARIANT_COMPONENT_NAME,
        )
        .reduce((variantNames, variant) => {
          const variantNameAttribute = variant.openingElement.attributes.find(
            (attr) => attr.name.name === 'name',
          );
          const variantNameValue = variantNameAttribute.value.value;

          variantNames.push(variantNameValue);

          return variantNames;
        }, []);

      if (variantNames.length === 0) {
        throw new Error('Found experiment w/o variants');
      }

      if (!cache[experimentNameValue]) {
        cache[experimentNameValue] = variantNames;
      } else {
        const uniqueVariantNames = new Set([
          ...cache[experimentNameValue],
          ...variantNames,
        ]);

        cache[experimentNameValue] = [...uniqueVariantNames];
      }

      path.skip();
    },
  };
}

function isEmptyObject(obj): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function extractExperimentData(filePath): object | undefined {
  const extension = nodePath.extname(filePath);

  if (extension !== '.tsx' && extension !== '.jsx') {
    return;
  }

  const ast = parse(fs.readFileSync(filePath, 'utf8'), {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'classProperties'],
  });

  const values = {};

  traverse(ast, getVisitor(values));

  return isEmptyObject(values) ? undefined : values;
}
