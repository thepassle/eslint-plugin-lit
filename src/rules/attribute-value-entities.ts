/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows unencoded HTML entities in attribute values',
      category: 'Best Practices',
      recommended: true,
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/attribute-value-entities.md'
    },
    messages: {
      unencoded:
        'Attribute values may not contain unencoded HTML ' +
        'entities, e.g. use `&gt;` instead of `>`'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const disallowedPattern = /([<>"]|&(?!(#\d+|[a-z]+);))/;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          const analyzer = TemplateAnalyzer.create(node);

          analyzer.traverse({
            enterElement: (element): void => {
              // eslint-disable-next-line guard-for-in
              for (const attr in element.attribs) {
                const loc = analyzer.getLocationForAttribute(element, attr);
                const rawValue = analyzer.getRawAttributeValue(element, attr);

                if (!loc || !rawValue) {
                  continue;
                }

                if (disallowedPattern.test(rawValue)) {
                  context.report({
                    loc: loc,
                    messageId: 'unencoded'
                  });
                }
              }
            }
          });
        }
      }
    };
  }
};

export = rule;
