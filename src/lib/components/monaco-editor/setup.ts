import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

if (typeof self !== 'undefined') {
  (self as any).MonacoEnvironment = {
    getWorker() {
      return new editorWorker();
    }
  };
}

export default monaco;
