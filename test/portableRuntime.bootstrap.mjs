import path from 'node:path';
import {pathToFileURL} from 'node:url';
const coreRoot=path.resolve(String(process.env.TIINEX_TEST_CORE_ROOT||''));
const nativeRoot=String(process.env.TIINEX_TEST_NATIVE_ROOT||'');
if(!nativeRoot||!path.isAbsolute(nativeRoot))throw Error('tiinex.host-test.native-root-required');
process.env.TIINEX_CONTENT_ROOTS=[nativeRoot,process.env.TIINEX_CONTENT_ROOTS].filter(Boolean).join(path.delimiter);
const {initializePortableNodeRuntime}=await import(pathToFileURL(path.join(coreRoot,'src/tooling/portable/adapters/node/portableRuntime.initialize.js')).href);
const ready=await initializePortableNodeRuntime({runtimeRoot:coreRoot,contentRoots:[nativeRoot],discoverBundled:false,discoverInstalled:false});
if(!['ready','qualified'].includes(ready.status))throw Error(`tiinex.host-test.runtime-unqualified:${JSON.stringify(ready.findings)}`);
