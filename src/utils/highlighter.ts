import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';

export function highlightCode(code: string, mode: string): string {
  let lang = Prism.languages.javascript;
  let grammarName = 'javascript';

  if (mode === 'playwright') {
    grammarName = 'typescript';
    lang = Prism.languages.typescript || Prism.languages.javascript;
  } else if (mode === 'python') {
    grammarName = 'python';
    lang = Prism.languages.python || Prism.languages.javascript;
  } else if (mode === 'curl') {
    grammarName = 'bash';
    lang = Prism.languages.bash || Prism.languages.javascript;
  }

  try {
    return Prism.highlight(code, lang, grammarName);
  } catch (err) {
    return code;
  }
}
