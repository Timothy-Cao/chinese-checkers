// Custom Node.js loader that resolves extensionless imports to .js files
// This bridges the gap between CRA's webpack (no extensions needed) and Node ESM (extensions required)

export async function resolve(specifier, context, nextResolve) {
  // Only handle relative imports without extensions
  if (specifier.startsWith('.') && !specifier.endsWith('.js') && !specifier.endsWith('.mjs')) {
    try {
      return await nextResolve(specifier + '.js', context);
    } catch {
      return await nextResolve(specifier, context);
    }
  }
  return nextResolve(specifier, context);
}
