import { PDFParse } from 'pdf-parse';
console.log("PDFParse class:", PDFParse);

// Let's see if we can instantiate it or call a parse function on it
const methods = Object.getOwnPropertyNames(PDFParse);
console.log("Static methods on PDFParse:", methods);
const protoMethods = Object.getOwnPropertyNames(PDFParse.prototype);
console.log("Instance methods on PDFParse:", protoMethods);
