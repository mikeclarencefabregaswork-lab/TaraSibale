import ts from 'typescript';

const cell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

export function declarationDetails(source, label, line) {
  const tree = ts.createSourceFile(source.path, source.text, ts.ScriptTarget.Latest, true);
  const wanted = label.replace(/\(\)$/, '').replace(/^\./, '');
  const candidates = [];
  function visit(node) {
    const name = node.name?.getText(tree).replace(/^['"]|['"]$/g, '');
    if (name === wanted || (wanted === 'constructor' && ts.isConstructorDeclaration(node))) candidates.push(node);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  candidates.sort((a, b) => Math.abs(tree.getLineAndCharacterOfPosition(a.getStart(tree)).line + 1 - line)
    - Math.abs(tree.getLineAndCharacterOfPosition(b.getStart(tree)).line + 1 - line));
  const node = candidates[0];
  if (!node) return { start: line, end: Math.min(source.lines.length, line + 15), prose: 'The extractor recorded this source location; a named TypeScript declaration could not be matched. The excerpt below is a source window, not a verified complete definition.' };
  const start = tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  const end = tree.getLineAndCharacterOfPosition(node.end).line + 1;
  const kind = ts.SyntaxKind[node.kind];
  let prose = `Declaration kind: **${kind}**. This declaration spans lines ${start}–${end} in the current file.`;
  if (node.type) prose += ` Its declared type is \`${cell(node.type.getText(tree)).slice(0, 220)}\`.`;
  let details = '';
  if (ts.isInterfaceDeclaration(node) || (node.type && ts.isTypeLiteralNode(node.type))) {
    const members = node.members ?? node.type.members;
    details = '\n\n### Fields and callbacks\n\n| Member | Declared contract |\n| --- | --- |\n'
      + [...members].map((m) => `| ${cell(m.name?.getText(tree) ?? '(signature)')}${m.questionToken ? ' (optional)' : ''} | \`${cell(m.type?.getText(tree) ?? m.getText(tree)).replaceAll('`', "'")}\` |`).join('\n');
  }
  let callable = node;
  if (ts.isVariableDeclaration(node) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) callable = node.initializer;
  if (callable.parameters) {
    details += '\n\n### Inputs\n\n' + (callable.parameters.length
      ? callable.parameters.map((p) => `- \`${p.name.getText(tree)}\`${p.questionToken || p.initializer ? ' (optional/defaulted)' : ''}: ${p.type ? `\`${cell(p.type.getText(tree)).replaceAll('`', "'")}\`` : 'type inferred by TypeScript'}${p.initializer ? `; default \`${cell(p.initializer.getText(tree))}\`` : ''}.`).join('\n')
      : 'This function declares no parameters. It can still read captured state or external dependencies; consult its body.');
  }
  if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
    details += `\n\n### Data shape\n\nThe literal array contains **${node.initializer.elements.length} entries** in source. This is a source count, not a live database count.`;
    const first = node.initializer.elements[0];
    if (first && ts.isObjectLiteralExpression(first)) details += ` The first entry declares: ${first.properties.map((p) => `\`${p.name?.getText(tree) ?? '(spread)'}\``).join(', ')}.`;
  }
  return { start, end, prose, details };
}

