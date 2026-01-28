import type * as Monaco from 'monaco-editor';

export const NOIR_LANGUAGE_ID = 'noir';

export const noirLanguageDefinition: Monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.noir',

  keywords: [
    'fn',
    'let',
    'mut',
    'pub',
    'struct',
    'impl',
    'trait',
    'type',
    'if',
    'else',
    'for',
    'in',
    'while',
    'return',
    'use',
    'mod',
    'as',
    'where',
    'const',
    'global',
    'comptime',
    'unconstrained',
    'assert',
    'assert_eq',
    'self',
    'Self',
    'true',
    'false',
    'crate',
    'super',
    'dep',
    'break',
    'continue',
    'match',
    'unsafe',
    'contract',
  ],

  typeKeywords: [
    'Field',
    'bool',
    'u8',
    'u16',
    'u32',
    'u64',
    'u128',
    'i8',
    'i16',
    'i32',
    'i64',
    'i128',
    'str',
    'fmtstr',
    'Option',
    'Result',
    'Vec',
    'BoundedVec',
    'Slice',
  ],

  builtins: [
    'println',
    'print',
    'std',
    'hash',
    'poseidon',
    'pedersen',
    'ecdsa_secp256k1',
    'ecdsa_secp256r1',
    'schnorr',
    'merkle',
    'sha256',
    'sha512',
    'keccak256',
    'blake2s',
    'blake3',
    'ec',
    'field',
    'collections',
    'option',
    'default',
  ],

  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '==',
    '<=',
    '>=',
    '!=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '^',
    '%',
    '<<',
    '>>',
    '+=',
    '-=',
    '*=',
    '/=',
    '&=',
    '|=',
    '^=',
    '%=',
    '<<=',
    '>>=',
    '->',
    '=>',
    '::',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root: [
      // Identifiers and keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            '@typeKeywords': 'type',
            '@keywords': 'keyword',
            '@builtins': 'predefined',
            '@default': 'identifier',
          },
        },
      ],
      [/[A-Z][\w$]*/, 'type.identifier'],

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        },
      ],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // Delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // Characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid'],

      // Attributes
      [/#\[.*?\]/, 'annotation'],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  },
};

export const noirLanguageConfiguration: Monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    markers: {
      start: /^\s*\/\/\s*#?region\b/,
      end: /^\s*\/\/\s*#?endregion\b/,
    },
  },
  indentationRules: {
    increaseIndentPattern: /^.*\{[^}"']*$|^.*\([^)"']*$/,
    decreaseIndentPattern: /^\s*[\}\]]/,
  },
};

export const noirThemeData: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'C586C0' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'type.identifier', foreground: '4EC9B0' },
    { token: 'predefined', foreground: 'DCDCAA' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.escape', foreground: 'D7BA7D' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'number.hex', foreground: 'B5CEA8' },
    { token: 'number.float', foreground: 'B5CEA8' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'delimiter', foreground: 'D4D4D4' },
    { token: 'annotation', foreground: 'DCDCAA' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editorLineNumber.foreground': '#858585',
    'editorCursor.foreground': '#AEAFAD',
    'editor.selectionBackground': '#264F78',
    'editor.inactiveSelectionBackground': '#3A3D41',
  },
};

export const noirLightThemeData: Monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'AF00DB' },
    { token: 'type', foreground: '267F99' },
    { token: 'type.identifier', foreground: '267F99' },
    { token: 'predefined', foreground: '795E26' },
    { token: 'identifier', foreground: '001080' },
    { token: 'string', foreground: 'A31515' },
    { token: 'string.escape', foreground: 'EE0000' },
    { token: 'number', foreground: '098658' },
    { token: 'number.hex', foreground: '098658' },
    { token: 'number.float', foreground: '098658' },
    { token: 'comment', foreground: '008000' },
    { token: 'operator', foreground: '000000' },
    { token: 'delimiter', foreground: '000000' },
    { token: 'annotation', foreground: '795E26' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#000000',
    'editorLineNumber.foreground': '#237893',
    'editorCursor.foreground': '#000000',
    'editor.selectionBackground': '#ADD6FF',
    'editor.inactiveSelectionBackground': '#E5EBF1',
  },
};

// Noir code completions
export const noirCompletionItemProvider: Monaco.languages.CompletionItemProvider = {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions: Monaco.languages.CompletionItem[] = [
      // Keywords
      {
        label: 'fn',
        kind: 14, // Keyword
        insertText: 'fn ${1:name}(${2:params}) -> ${3:ReturnType} {\n\t$0\n}',
        insertTextRules: 4, // InsertAsSnippet
        documentation: 'Define a function',
        range,
      },
      {
        label: 'struct',
        kind: 14,
        insertText: 'struct ${1:Name} {\n\t${2:field}: ${3:Type},\n}',
        insertTextRules: 4,
        documentation: 'Define a struct',
        range,
      },
      {
        label: 'impl',
        kind: 14,
        insertText: 'impl ${1:Type} {\n\t$0\n}',
        insertTextRules: 4,
        documentation: 'Implement methods for a type',
        range,
      },
      {
        label: 'trait',
        kind: 14,
        insertText: 'trait ${1:Name} {\n\t$0\n}',
        insertTextRules: 4,
        documentation: 'Define a trait',
        range,
      },
      {
        label: 'let',
        kind: 14,
        insertText: 'let ${1:name} = ${2:value};',
        insertTextRules: 4,
        documentation: 'Declare a variable',
        range,
      },
      {
        label: 'let mut',
        kind: 14,
        insertText: 'let mut ${1:name} = ${2:value};',
        insertTextRules: 4,
        documentation: 'Declare a mutable variable',
        range,
      },
      {
        label: 'assert',
        kind: 14,
        insertText: 'assert(${1:condition});',
        insertTextRules: 4,
        documentation: 'Assert a condition',
        range,
      },
      {
        label: 'assert_eq',
        kind: 14,
        insertText: 'assert_eq(${1:left}, ${2:right});',
        insertTextRules: 4,
        documentation: 'Assert equality',
        range,
      },
      {
        label: 'for',
        kind: 14,
        insertText: 'for ${1:i} in ${2:0}..${3:n} {\n\t$0\n}',
        insertTextRules: 4,
        documentation: 'For loop',
        range,
      },
      {
        label: 'if',
        kind: 14,
        insertText: 'if ${1:condition} {\n\t$0\n}',
        insertTextRules: 4,
        documentation: 'If statement',
        range,
      },
      {
        label: 'if else',
        kind: 14,
        insertText: 'if ${1:condition} {\n\t$2\n} else {\n\t$0\n}',
        insertTextRules: 4,
        documentation: 'If-else statement',
        range,
      },
      // Types
      {
        label: 'Field',
        kind: 6, // Class
        insertText: 'Field',
        documentation: 'Native field element type',
        range,
      },
      {
        label: 'bool',
        kind: 6,
        insertText: 'bool',
        documentation: 'Boolean type',
        range,
      },
      {
        label: 'u8',
        kind: 6,
        insertText: 'u8',
        documentation: '8-bit unsigned integer',
        range,
      },
      {
        label: 'u32',
        kind: 6,
        insertText: 'u32',
        documentation: '32-bit unsigned integer',
        range,
      },
      {
        label: 'u64',
        kind: 6,
        insertText: 'u64',
        documentation: '64-bit unsigned integer',
        range,
      },
      // Standard library functions
      {
        label: 'main',
        kind: 3, // Function
        insertText: 'fn main(${1:x}: pub Field, ${2:y}: Field) {\n\t$0\n}',
        insertTextRules: 4,
        documentation: 'Main entry point for the circuit',
        range,
      },
      {
        label: 'poseidon::bn254::hash',
        kind: 3,
        insertText: 'std::hash::poseidon::bn254::hash_${1:n}([${2:inputs}])',
        insertTextRules: 4,
        documentation: 'Poseidon hash function',
        range,
      },
      {
        label: 'pedersen_hash',
        kind: 3,
        insertText: 'std::hash::pedersen_hash([${1:inputs}])',
        insertTextRules: 4,
        documentation: 'Pedersen hash function',
        range,
      },
      {
        label: 'sha256',
        kind: 3,
        insertText: 'std::hash::sha256(${1:input})',
        insertTextRules: 4,
        documentation: 'SHA-256 hash function',
        range,
      },
      {
        label: 'keccak256',
        kind: 3,
        insertText: 'std::hash::keccak256(${1:input}, ${2:len})',
        insertTextRules: 4,
        documentation: 'Keccak-256 hash function',
        range,
      },
      {
        label: 'println',
        kind: 3,
        insertText: 'println(${1:value});',
        insertTextRules: 4,
        documentation: 'Print value for debugging (unconstrained only)',
        range,
      },
    ];

    return { suggestions };
  },
};

export function registerNoirLanguage(monaco: typeof Monaco): void {
  // Register the language
  monaco.languages.register({ id: NOIR_LANGUAGE_ID });

  // Set the language configuration
  monaco.languages.setLanguageConfiguration(
    NOIR_LANGUAGE_ID,
    noirLanguageConfiguration
  );

  // Set the tokenizer
  monaco.languages.setMonarchTokensProvider(
    NOIR_LANGUAGE_ID,
    noirLanguageDefinition
  );

  // Register the completion provider
  monaco.languages.registerCompletionItemProvider(
    NOIR_LANGUAGE_ID,
    noirCompletionItemProvider
  );

  // Define the themes
  monaco.editor.defineTheme('noir-dark', noirThemeData);
  monaco.editor.defineTheme('noir-light', noirLightThemeData);
}
