declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "lz-string" {
  const LZString: {
    compressToEncodedURIComponent(input: string): string;
    decompressFromEncodedURIComponent(input: string): string | null;
    compressToBase64(input: string): string;
    decompressFromBase64(input: string): string | null;
  };

  export default LZString;
}
