import {globSync} from "glob";
import path from "path";

export default function globResolverPlugin (globOptions) {
  if (globOptions === null || !globOptions.cwd || !globOptions.ignore) {
    throw new Error("globResolverPlugin: You must provide globOptions (at least `cwd` and `ignore`) to configure the glob search. See https://www.npmjs.com/package/glob")
  }
  const prefix = '@find/'
  return {
    name: '@raquo/vite-plugin-glob-resolver',
    resolveId (sourcePath) {
      if (sourcePath.startsWith(prefix)) {
        const {moduleId, querySuffix} = splitModuleId(sourcePath);

        const globPattern = moduleId.substring(prefix.length);
        const matchedFiles = globSync(globPattern, globOptions);

        if (matchedFiles.length === 0) {
          throw new Error(`globResolverPlugin: Unable to @find pattern ${globPattern}`);
        } else if (matchedFiles.length > 1) {
          throw new Error(`globResolverPlugin: Ambiguous @find pattern ${globPattern}, found multiple matches:\n> ${matchedFiles.join("\n> ")}\nPlease use a more specific glob pattern.`);
        } else {
          const matchedFile = path.resolve(globOptions.cwd, matchedFiles[0]) + querySuffix;
          return matchedFile;
        }
      }
      return null; // Let Vite handle all other imports
    }
  };
}

/** Helper to split e.g. "foo.css?used" into "foo" and "?used" */
export function splitModuleId (id) {
  const indexOfQuery = id.lastIndexOf("?");
  let moduleId = id;
  let querySuffix = ""
  if (indexOfQuery !== -1) {
    moduleId = id.substring(0, indexOfQuery)
    querySuffix = id.substring(indexOfQuery)
  }
  return {
    moduleId, // anything before the last "?", or the whole module id if there is no query
    querySuffix // everything after and including "?", or an empty string if there is no query
  }
}
